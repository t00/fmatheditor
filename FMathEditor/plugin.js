var FMath_selectedElement = null;

tinymce.PluginManager.add('FMathEditor', function (editor, url) {

  editor.addCommand('FMathEditor', function () {
    editor.windowManager.open({
      title: 'Equation Editor',
      file: url + '/editor/onlyEditor.html',
      width: 1050,
      id: 'FMathEditorIFrame',
      height: 500,
      buttons: [{
        text: 'Insert Equation',
        onclick: function () {
          var frame = null;
          var frames = document.getElementsByTagName("iframe");
          for (i = 0; i < frames.length; ++i) {
            var src = frames[i].src;
            if (src != null && src.indexOf('onlyEditor.html') > -1) {
              frame = frames[i];
              break;
            }
          }
          var mathml = frame.contentWindow.getMathML();
          var img = frame.contentWindow.getBlobOrUrl(function (result) {
            if (result.indexOf("ERROR:") == 0) {
              alert(result);
            } else {
              // minimum usable base64 encoded png image size to accept including header)
              if(result.length >= 32) {
                var img = result;
                var editor = tinymce.activeEditor;
                editor.insertContent('<img id="newFormula" alt="MathML (base64):' + window.btoa(mathml) + '" src="' + img + '"/>');
                var formulaElement = editor.getDoc().getElementById('newFormula');
                formulaElement.removeAttribute('id');
                formulaElement.onload = function () {
                  if (formulaElement.clientWidth > 0) {
                    formulaElement.width = formulaElement.clientWidth;
                  }
                  if (formulaElement.clientHeight > 0) {
                    formulaElement.height = formulaElement.clientHeight;
                  }
                }
              }
              editor.windowManager.close();
            }
          });
        }
      }, {
        text: 'Close',
        onclick: 'close'
      }]
    });
  });

  editor.on('NodeChange', function (e) {
    if (e.element.nodeName == 'IMG') {
      FMath_selectedElement = e.element;
    } else {
      FMath_selectedElement = null;
    }
  });

  editor.addButton('FMathEditor', {
    title: 'Insert equation',
    image: url + '/icons/FMathEditor.png',
    cmd: 'FMathEditor'
  });

});

function getMathMLToLoad() {
  if (FMath_selectedElement != null) {
    var alt = FMath_selectedElement.alt;
    if (alt != null && alt.indexOf("MathML (base64):") == 0) {
      var mathml = alt.substring(16, alt.length);
      return window.atob(mathml);
    }
  }
  return null;
}
