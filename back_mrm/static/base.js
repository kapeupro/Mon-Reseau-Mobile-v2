const lunchUpdateSite = () => {
    const date = $(".datepicker").val();

    $("#pb_message_loading").html("Mise à jours en cours...");

    $("#loadingModalBase").modal("show");

    $.ajax({
        url: URL_MAJ_SITE,
        type: "GET",
        data: { date: date },
        success: function (response) {
            if (response.success) {
                $("#pb_message_loading").html("Mise à jour effectuée");
            } else {
                $("#pb_message_loading").html(
                    "Mise à jour erronée : " + response.msg
                );
            }
            setTimeout(() => {
                $("#loadingModalBase").modal("hide");
            }, 2000);
        },
        error: function (xhr, status, error) {
            $("#loadingModalBase").modal("hide");
        },
    });
};

const lunchCopySchema = (schema_public, schema_private) => {
    $("#pb_message_loading").html("Copie en cours...");

    $("#loadingModalBase").modal("show");

    $.ajax({
        url: URL_COPY_SCHEMA,
        type: "GET",
        data: { public: schema_public, private: schema_private },
        success: function (response) {
            let elementReturn;
            if (response.success) {
                elementReturn = $("<div>", {
                    class: "alert alert-success",
                }).html("Copie schéma effectuée");
            } else {
                elementReturn = $("<div>", {
                    class: "alert alert-danger",
                }).html("Copie non effectuée : " + response.msg);
            }
            $("#pb_message_loading").html(elementReturn);
            setTimeout(() => {
                $("#loadingModalBase").modal("hide");
            }, 2000);
        },
        error: function (xhr, status, error) {
            $("#loadingModalBase").modal("hide");
        },
    });
};

const initDatePicker = () => {
    const today = new Date();

    $(".datepicker").datepicker({
        dateFormat: "yy-mm-dd",
    });

    $(".datepicker").datepicker("setDate", today);
};

const lunchImportSignalement = () => {
    $("#pb_message_loading").html(
        "Import des données signalements en cours..."
    );

    $("#loadingModalBase").modal("show");

    $.ajax({
        url: URL_IMPORT_SIGNALEMENT,
        type: "GET",
        success: function (response) {
            if (response.success) {
                $("#pb_message_loading").html(
                    "Import des données signalements effectué"
                );
            } else {
                $("#pb_message_loading").html(
                    "Erreur lors de l import des données signalements : " +
                        response.msg
                );
            }
            setTimeout(() => {
                $("#loadingModalBase").modal("hide");
            }, 2000);
        },
        error: function (xhr, status, error) {
            $("#loadingModalBase").modal("hide");
        },
    });
};

$(function () {
    initDatePicker();
});
