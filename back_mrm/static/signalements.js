let fileTable = null,
    dbTable = null;

const dataTableFrancais = {
    sProcessing: "Traitement en cours...",
    sSearch: "Rechercher&nbsp;:",
    sLengthMenu: "Afficher _MENU_ &eacute;l&eacute;ments",
    sInfo: "Résultats _START_ &agrave; _END_ sur _TOTAL_ ",
    sInfoEmpty: "0 &eacute;l&eacute;ment(s)",
    sInfoFiltered: "filtr&eacute; (total _MAX_ résultats)",
    sInfoPostFix: "",
    sLoadingRecords: "Chargement en cours...",
    sZeroRecords: "Aucun &eacute;l&eacute;ment &agrave; afficher",
    sEmptyTable: "Aucune donn&eacute;e disponible dans le tableau",
    oPaginate: {
        sFirst: "Premier",
        sPrevious: "Pr&eacute;c&eacute;dent",
        sNext: "Suivant",
        sLast: "Dernier",
    },
    oAria: {
        sSortAscending: ": activer pour trier la colonne par ordre croissant",
        sSortDescending:
            ": activer pour trier la colonne par ordre d&eacute;croissant",
    },
};

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(
                    cookie.substring(name.length + 1)
                );
                break;
            }
        }
    }
    return cookieValue;
}

//Fonction qui ouvre la modal de chargement initialisée
const initLoadingMessage = (maxValue) => {
    let progressbar = $("#progressbar"),
        progressLabel = $(".progress-label");

    $("body").addClass("loading");
    $(".modalFooter").hide();
    $("#loadingModal").modal("show");
    //On vide les messages
    $("#message_loading").html();

    progressLabel.text("Chargement en cours");
    $("#progressbar").progressbar({
        max: maxValue,
        value: 0,
        change: function () {
            progressLabel.text(
                progressbar.progressbar("value") + "/" + maxValue
            );
        },
    });
};

const hideLoadingMessage = () => {
    $(".modalFooter").show();
    $("#closeModal").on("click", function () {
        $("body").removeClass("loading");
        $("#loadingModal").modal("hide");
        $("#message_loading").empty();
        location.reload();
    });
};

const postDataFile = async (filename, table) => {
    const url = $(`#importButton${table}`).data("url");
    let response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({ files: filename }),
    });
    let data = await response.json();
    return data;
};

const postConsolidation = async (table) => {
    let progressLabel = $(".progress-label");
    progressLabel.text("Consolidation des données ... (Patientez)");
    const idConsolidation = `#consolidation${table}`;
    if ($(idConsolidation).length > 0) {
        const urlConsolidation = $(idConsolidation).data("url");

        // Vérifiez si l'attribut "data-url" est défini sur l'élément
        if (urlConsolidation) {
            const urlConsolidation = $(idConsolidation).data("url");
            let response = await fetch(urlConsolidation, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
                body: JSON.stringify({ files: "" }),
            });
            let data = await response.json();

            return data;
        }
    }
};

const initTable = () => {
    if ($("#fileTable").length > 0 || $("#tableBd").length > 0) {
        fileTable = new DataTable("#fileTable", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButton("Signalements");
            },
        });

        fileTable.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTable = new DataTable("#tableBd", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("Signalements");
                initButtonDeleteAllDb("Signalements");
            },
        });
    }
};

const initButton = (table) => {
    $(`.delete_file${table}`).on("click", function () {
        const lunchDeleteFile = () => {
            const url = $(this).data("url");
            fetch(url, {
                method: "DELETE", // Method itself
                headers: {
                    "Content-type": "application/json; charset=UTF-8", // Indicates the content
                    "X-CSRFToken": getCookie("csrftoken"),
                },
            })
                .then((response) => {
                    if (response.ok) {
                        window.location.reload();
                    }
                })
                .catch((error) =>
                    alert("Erreur lors de la suppression : ", error)
                );
        };

        ConfirmDialog(
            "suppression fichier",
            "Le fichier sera supprimé, continuer?",
            lunchDeleteFile
        );
    });
    $(`.import_file_${table}`)
        .off("click")
        .on("click", async function (e) {
            //On lance la div de chargement
            const importType = $(this).data("import-type");
            const filename = $(this).data("filename");

            const spaceSpecialCharRegex = /[^\w.-]/;
            if (spaceSpecialCharRegex.test(filename)) {
                $(`#errorMsg${table}`).text("Nom de fichier incorrect !");
                $(`#errorSection${table}`).show();
                $(`.closeErrorMsg${table}`).on("click", function () {
                    hideErrorMsg(table);
                });
            } else {
                initLoadingMessage(1);
                let progressBarValue = 0;
                let isImported = false;

                // Vérifiez si le type d'importation correspond à la table spécifiée
                if (importType.toLowerCase() === table.toLowerCase()) {
                    //Pour bien faire on pourrait mettre tout ca dans une fonction async

                    let message = "";
                    let dataPost = await postDataFile(filename, importType);
                    if (dataPost) {
                        let elementReturn = $("<div>", {
                            class: "alert alert-success",
                        }).append(filename + " : " + dataPost.message);
                        if (!dataPost.success) {
                            elementReturn = $("<div>", {
                                class: "alert alert-danger py-1",
                            }).append(filename + " : " + dataPost.message);
                        } else {
                            isImported = true;
                        }

                        //mettre le message dans la popup
                        $("#message_loading").append(elementReturn);
                        progressBarValue++;
                        $("#progressbar").progressbar(
                            "option",
                            "value",
                            progressBarValue
                        );
                        hideLoadingMessage();
                    }
                }
            }
        });
};

const showMessage = (message) => {
    $("body").addClass("loading");
    $("#messageModal").modal("show");
    $("#labelMessage").text(message);
};

const hideMessage = (message, success) => {
    $("#labelMessage").text(message);
    if (success) {
        $("#labelMessage").css("color", "green");
    } else {
        $("#labelMessage").css("color", "red");
    }
    setTimeout(() => {
        $("#messageModal").modal("hide");
        $("body").removeClass("loading");
        $("#labelMessage").empty();
        window.location.reload();
    }, 1000);
};

const initButtonDeleteDb = (table) => {
    $(`.delete_bd${table}`).on("click", function () {
        const lunchDeleteDataInBase = () => {
            showMessage("Suppression en cours...");
            const url = $(this).data("url");
            fetch(url, {
                method: "DELETE", // Method itself
                headers: {
                    "Content-type": "application/json; charset=UTF-8", // Indicates the content
                    "X-CSRFToken": getCookie("csrftoken"),
                },
            })
                .then((response) => {
                    if (response.ok) {
                        hideMessage("Suppression terminée !", true);
                    }
                })
                .catch((error) =>
                    hideMessage(
                        `Erreur lors de la suppression : ${error}`,
                        false
                    )
                );
        };

        ConfirmDialog(
            "suppression des données en base",
            "Les données seront supprimées en base, continuer?",
            lunchDeleteDataInBase
        );
    });
};

const initButtonDeleteAllDb = (table) => {
    $(`#deleteAll_${table}`).on("click", function () {
        const lunchDeleteAllDataInBase = () => {
            showMessage("Suppression en cours...");
            const url = $(this).data("url");
            const tablename = $(this).data("tablename");
            const type = $(this).data("type");

            const fullurl = `${url}?table=${tablename}&type=${type}`;
            fetch(fullurl, {
                method: "DELETE",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
            })
                .then((response) => {
                    if (response.ok) {
                        hideMessage("Suppression terminée !", true);
                    }
                })
                .catch((error) =>
                    hideMessage(
                        `Erreur lors de la suppression : ${error}`,
                        false
                    )
                );
        };

        ConfirmDialog(
            "suppression des données en base",
            "Attention, toutes les données de la table seront supprimées en base, continuer?",
            lunchDeleteAllDataInBase
        );
    });
};

const importButton = (table, fileTable) => {
    $(`#importButton${table}`)
        .off("click")
        .on("click", async function () {
            const importFile = async () => {
                initLoadingMessage(selectedFiles.length);
                let progressBarValue = 0;
                let message = "";
                let nombreImported = 0;
                for (const filename of selectedFiles) {
                    let dataPost = await postDataFile(filename, table);
                    if (dataPost) {
                        let elementReturn = $("<div>", {
                            class: "alert alert-success",
                        }).append(filename + " : " + dataPost.message);
                        if (!dataPost.success) {
                            const spaceSpecialCharRegex = /[^\w.-]/;
                            if (spaceSpecialCharRegex.test(filename)) {
                                elementReturn = $("<div>", {
                                    class: "alert alert-danger py-1",
                                }).append(
                                    filename + " : Nom de fichier incorrect !"
                                );
                            } else {
                                elementReturn = $("<div>", {
                                    class: "alert alert-danger py-1",
                                }).append(filename + " : " + dataPost.message);
                            }
                        } else {
                            nombreImported++;
                        }

                        $("#message_loading").append(elementReturn);
                        progressBarValue++;
                        $("#progressbar").progressbar(
                            "option",
                            "value",
                            progressBarValue
                        );

                        if (progressBarValue == selectedFiles.length) {
                            hideLoadingMessage();
                        }
                    }
                }
            };

            let selectedFiles = [];
            let selectedRows = fileTable.rows(".selected").data().toArray();
            selectedFiles = selectedRows.map((row) => row[0]);
            if (selectedFiles.length == 0) {
                if (fileTable.settings().length > 0) {
                    if (
                        fileTable.settings()[0].oPreviousSearch.sSearch !== ""
                    ) {
                        selectedRows = fileTable
                            .rows({ search: "applied" })
                            .data()
                            .toArray();
                    } else {
                        selectedRows = fileTable.rows().data().toArray();
                    }
                    selectedFiles = selectedRows.map((row) => row[0]);
                    if (selectedFiles.length == 0) {
                        MessageDialog(
                            "Information",
                            "Aucun fichier à importer"
                        );
                    } else {
                        const importAllFiles = () => {
                            importFile();
                        };

                        ConfirmDialog(
                            "Import fichier",
                            "Voulez-vous importer tous les fichiers?",
                            importAllFiles
                        );
                    }
                } else {
                    MessageDialog("Information", "Aucun fichier à importer");
                }
            } else {
                importFile();
            }
        });
};

const consolidationButton = (table) => {
    $(`#consolidation${table}`).on("click", async function () {
        showMessage("Consolidation en cours... (Patientez)");
        const data_post = await postConsolidation(table);
        let message = "Consolidation terminée";
        if (!data_post.success) {
            message = "Echec lors de la consolidation";
        }
        hideMessage(message, data_post.success);
    });
};

const initErrorMsg = () => {
    hideErrorMsg("Signalements");
};

const hideErrorMsg = (id) => {
    $(`#errorSection${id}`).hide();
};

const initModalUpload = () => {
    initUpload("Signalements");
};

const initUpload = (table) => {
    $(`#upload-btn-${table}`).click(function (event) {
        event.preventDefault();

        $.ajax({
            url: $(this).attr("href"),
            type: "GET",
            dataType: "html",
            success: function (response) {
                $("#modal-body-content").html(response);
                $("#uploadModal").modal("show");
                $("#file-form").submit(function (e) {
                    e.preventDefault();

                    var formData = new FormData(this);
                    $.ajax({
                        url: $(this).attr("action"),
                        type: "POST",
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (response) {
                            if (response.success) {
                                alert(response.message);
                            } else {
                                alert("Error: " + response.message);
                            }
                            $("#uploadModal").modal("hide");
                            location.reload();
                        },
                        error: function (xhr, status, error) {
                            alert(
                                "An error occurred while uploading the files."
                            );
                        },
                    });
                });
            },
            error: function (xhr, status, error) {
                alert("An error occurred while loading the content.");
            },
        });
    });

    $("#uploadModal").on("click", ".btn-secondary", function () {
        $("#uploadModal").modal("hide");
    });
};

$(function () {
    initTable();
    initErrorMsg();
    importButton("Signalements", fileTable);
    consolidationButton("Signalements");
    initModalUpload();
});
