import axios from 'axios';
import LogoSparcWavePrimary from '../assets/logo-sparc-wave-primary.svg';

export default {
  //this mixin is not used by this code base but it can be used by other
  //projects to get a handle to various resources
  data() {
    return {
      defaultImg: LogoSparcWavePrimary,
    };
  },
  methods: {
    async getRequest(url, params, timeout) {
      return await axios({
        method: 'get',
        url,
        params,
        timeout,
      });
    },
    /**
     * Returns a file path for S3.
     * @param {String} dataset_id dataset id.
     * @param {String} dataset_version dataset version.
     * @param {String} file_path file path.
     * @returns {String} full path to S3 file.
     */
    getS3FilePath(dataset_id, dataset_version, file_path) {
      const encoded_file_path = encodeURIComponent(file_path);
      return `${dataset_id}/${dataset_version}/files/${encoded_file_path}`;
    },
    /**
     * Find data path in the array that matches the provide path
     */
    findEntryWithPathInArray(array, path) {
      if (path && array) {
        for (let i = 0; i < array.length; i++) {
          if (path === array[i].dataset.path) return array[i];
        }
      }
      return undefined;
    },
    getThumbnailForPlot(plot, thumbnails) {
      if (thumbnails && plot) {
        return this.findEntryWithPathInArray(thumbnails, plot.datacite.isSourceOf.path[0]);
      }
      return undefined;
    },
    /**
     * Use the scaffoldViews to help with finding the correct thumbnails.
     * Use the index if the workflow stated above fails.
     */
    getThumbnailForScaffold(scaffold, scaffoldViews, thumbnails, index) {
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
    },
    getImageURLFromS3(apiEndpoint, info) {
      let url = `${apiEndpoint}/s3-resource/${info.datasetId}/${info.datasetVersion}/files/${info.file_path}?encodeBase64=true`;
      if (info.s3Bucket) {
        url = url + `&s3BucketName=${info.s3Bucket}`;
      }
      return url;
    },
  },
};
