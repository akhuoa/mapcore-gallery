import axios from 'axios';
import LogoSparcWavePrimary from '../assets/logo-sparc-wave-primary.svg';

export default function useS3() {
  const defaultImg = LogoSparcWavePrimary;

  async function getRequest(url, params, timeout) {
    return await axios({
      method: 'get',
      url,
      params,
      timeout,
    });
  }
  /**
   * Returns a file path for S3.
   * @param {String} dataset_id dataset id.
   * @param {String} dataset_version dataset version.
   * @param {String} file_path file path.
   * @returns {String} full path to S3 file.
   */
  function getS3FilePath(dataset_id, dataset_version, file_path) {
    const encoded_file_path = encodeURIComponent(file_path);
    return `${dataset_id}/${dataset_version}/files/${encoded_file_path}`;
  }
  /**
   * Find data path in the array that matches the provide path
   */
  function findEntryWithPathInArray(array, path) {
    if (path && array) {
      for (let i = 0; i < array.length; i++) {
        if (path === array[i].dataset.path) return array[i];
      }
    }
    return undefined;
  }
  function getThumbnailForPlot(plot, thumbnails) {
    if (thumbnails && plot) {
      return this.findEntryWithPathInArray(thumbnails, plot.datacite.isSourceOf.path[0]);
    }
    return undefined;
  }
  /**
   * Use the scaffoldViews to help with finding the correct thumbnails.
   * Use the index if the workflow stated above fails.
   */
  function getThumbnailForScaffold(scaffold, scaffoldViews, thumbnails, index) {
    if (thumbnails && thumbnails.length > 0) {
      let thumbnail = undefined;
      if (scaffold && scaffoldViews) {
        const view = this.findEntryWithPathInArray(
          scaffoldViews,
          scaffold.datacite.isSourceOf.path[0],
        );
        if (view) {
          thumbnail = this.findEntryWithPathInArray(thumbnails, view.datacite.isSourceOf.path[0]);
        }
      }
      if (thumbnail) {
        return thumbnail;
      } else if (index < thumbnails.length) {
        return thumbnails[index];
      }
    }
    return undefined;
  }
  function getImageURLFromS3(apiEndpoint, info) {
    let url = `${apiEndpoint}/s3-resource/${info.datasetId}/${info.datasetVersion}/files/${info.file_path}?encodeBase64=true`;
    if (info.s3Bucket) {
      url = url + `&s3BucketName=${info.s3Bucket}`;
    }
    return url;
  }
  function getSegmentationThumbnailURL(apiEndpoint, info) {
    let endpoint = `${apiEndpoint}/thumbnail/neurolucida`;
    endpoint = endpoint + `?datasetId=${info.datasetId}`;
    endpoint = endpoint + `&version=${info.datasetVersion}`;
    endpoint = endpoint + `&path=files/${info.segmentationFilePath}`;
    if (info.s3Bucket) {
      endpoint = endpoint + `&s3BucketName=${info.s3Bucket}`;
    }
    return endpoint;
  }
  function getThumbnailURLFromBiolucida(apiEndpoint, info) {
    return `${apiEndpoint}/thumbnail/${info.id}`;
  }
  function getImageInfoFromBiolucida(apiEndpoint, items, info) {
    const endpoint = `${apiEndpoint}/image/${info.id}`;
    const params = {};
    this.getRequest(endpoint, params, 20000).then(
      (response) => {
        let item = items.find((x) => x.id === info.id);
        const name = response.name;
        if (name) {
          item.title = name;
        }
      },
      (reason) => {
        if (
          reason.message.includes('timeout') &&
          reason.message.includes('exceeded') &&
          info.fetchAttempts < 3
        ) {
          info.fetchAttempts += 1;
          this.getImageInfoFromBiolucida(apiEndpoint, items, info);
        }

        return Promise.reject('Maximum iterations reached.');
      },
    );
  }
  return {
    defaultImg,
    getRequest,
  };
}
