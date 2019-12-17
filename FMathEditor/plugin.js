var FMath_selectedElement = null;

tinymce.PluginManager.add('FMathEditor', function (editor, url) {

  editor.addCommand('FMathEditor', function () {
    editor.windowManager.open({
      title: 'Equation Editor',
      body: {
        type: 'panel',
          items: [
          {
            type: 'htmlpanel',
            html: '<iframe style="width: 1024px; height: 440px" id="FMathEditorIFrame" src="' + url + '/editor/onlyEditor.html"></iframe>',
          }
        ]
      },
      buttons: [{
        text: 'Insert Equation',
        type: 'submit',
      }, {
        text: 'Close',
        type: 'cancel'
      }],

      onSubmit: function (dialogApi) {
        var frame = null;
        var frames = document.getElementsByTagName("iframe");
        for (i = 0; i < frames.length; ++i) {
          var src = frames[i].src;
          if (src != null && src.indexOf('onlyEditor.html') >= 0) {
            frame = frames[i];
            break;
          }
        }
        var mathml = frame.contentWindow.getMathML();

        var zoom = frame.contentDocument.querySelector('#FMathEd1_view_select_zoom');
        zoom.value = 400;

        var event;
        if (typeof (Event) === 'function') {
          event = new Event('change');
        } else {
          event = document.createEvent('Event');
          event.initEvent('change', true, true);
        }
        zoom.dispatchEvent(event);

        frame.contentWindow.getBlobOrUrl(function (result) {
          if (result.indexOf("ERROR:") == 0) {
            alert(result);
          } else {
            // minimum usable base64 encoded png image size to accept including header)
            if(result.length >= 32) {
              var canvas = frame.contentDocument.querySelector('#FMathEd1_mainCanvas');
              var img = canvas.toDataURL();
              var editor = tinymce.activeEditor;
              editor.insertContent('<img id="newFormula" alt="MathML (base64):' + window.btoa(mathml) + '" src="' + img + '"/>');
              var formulaElement = editor.getDoc().getElementById('newFormula');
              formulaElement.removeAttribute('id');
              formulaElement.onload = function () {
                if (formulaElement.clientWidth > 0 && formulaElement.clientHeight > 0) {
                  var width = formulaElement.clientWidth / 4;
                  var height = formulaElement.clientHeight / 4;

                  formulaElement.width = width;
                  formulaElement.height = height;
                }
              }
            }
            dialogApi.close();
          }
        });
      }
    });

    let dialogs = document.getElementsByClassName('tox-dialog');
    if (dialogs.length > 0) {
      dialogs[0].classList.add('formulaeditor');
    }
  });

  editor.on('NodeChange', function (e) {
    if (e.element.nodeName == 'IMG') {
      FMath_selectedElement = e.element;
    } else {
      FMath_selectedElement = null;
    }
  });

  editor.ui.registry.addButton('FMathEditor', {
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
