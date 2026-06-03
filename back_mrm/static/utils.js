const ConfirmDialog = (title, message, handler) => {
    $("<div></div>")
        .appendTo("body")
        .html("<div><p>" + message + "</p></div>")
        .dialog({
            modal: true,
            title: title,
            zIndex: 10000,
            autoOpen: true,
            width: "auto",
            resizable: false,
            dialogClass: "custom-dialog",
            showCloseButton: true,
            buttons: [
                {
                    text: "Oui",
                    class: "btn-yes",
                    click: function () {
                        $(this).dialog("close");
                        handler();
                    },
                },
                {
                    text: "Non",
                    class: "btn-no",
                    click: function () {
                        $(this).dialog("close");
                    },
                },
            ],
            close: function (event, ui) {
                $(this).remove();
            },
        });
};

const MessageDialog = (title, message) => {
    $("<div></div>")
        .appendTo("body")
        .html("<div style='max-width: 300px !important'><p>" + message + "</p></div>")
        .dialog({
            modal: true,
            title: title,
            zIndex: 10000,
            autoOpen: true,
            width: "auto",
            resizable: false,
            dialogClass: "custom-dialog",
            showCloseButton: true,
            buttons: [
                {
                    text: "Ok",
                    class: "btn-yes",
                    click: function () {
                        $(this).dialog("close");
                    },
                },
            ],
            close: function (event, ui) {
                $(this).remove();
            },
        });
};

