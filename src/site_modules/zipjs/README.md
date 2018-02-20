# why?

chrome 浏览器中解压zip文件。

插件"Chrome extension source viewer"中使用zip.js对CRX文件进行解压缩&压缩处理，
可以参考这个实现，强化py2npm的功能。

# home https://github.com/gildas-lormeau/zip.js

function handleBlob(blob, publicKey, raw_crx_data) {
    var progressDiv = document.getElementById('initial-status');
    progressDiv.hidden = true;
 
    setBlobAsDownload(blob);
    setRawCRXAsDownload(raw_crx_data);
    setPublicKey(publicKey);
 
    zip.createReader(new zip.BlobReader(blob), function(zipReader) {
        renderPanelResizer();
        zipReader.getEntries(handleZipEntries);
        window.addEventListener('unload', function() {
            zipReader.close();
            // Close background page as well, to avoid memory leak.....
            //chrome.extension.getBackgroundPage().close();
            // F***, Extension crashes if navigating away >.>
        });
    });
}

# 修改了什么？

  1, 放弃使用worker的方式(TODO: 还有部分代码残留, 有空清理);


# 哪里有参考


    https://github.com/gildas-lormeau/zip.js/tree/master/WebContent/tests






```
var {zip} = require("zipjs");

function zipBlob(fn, blob, callback, onerror) {
  zip.createWriter(new zip.BlobWriter("application/zip"),
    function (zipWriter) {
      zipWriter.add(fn, new zip.BlobReader(blob), function () {
        zipWriter.close(callback);
      });
    }, (onerror || function def_onerror(message) {
      console.error(message);
    }));
}

function unzipBlob(fn, blob, callback, onerror) {
  zip.createReader(new zip.BlobReader(blob),
    function (zipReader) {
      zipReader.getEntries(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var obj = entries[i];
          if (!obj.directory && obj.filename === fn) {
            obj.getData(new zip.BlobWriter("text/plain"), function (data) {
              zipReader.close();
              callback(data);
              return;
            });
          }
        }
        callback();  // not found the file
      });
    }, (onerror || function def_onerror(message) {
      console.error(message);
    })
  );
}


```