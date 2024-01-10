import downloadUrl from 'download';

export default function(httpUrl, dest, downloadOptions, fn) {
    return downloadUrl(httpUrl, dest, downloadOptions)
      .then(function (data) {
        fn();
      })
      .catch(function (err) {
        fn(err);
      });
}