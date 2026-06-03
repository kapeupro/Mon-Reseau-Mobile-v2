let fileTable = null,
    dbTableCouverture = null,
    fileTableStatNbOpe = null,
    fileTableCommune = null,
    fileTableDepartement = null,
    fileTableRegion = null,
    fileTableTerritoire = null;

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
    if ($("#fileTable").length > 0 || $("#tableCouvertureBd").length > 0) {
        fileTable = new DataTable("#fileTable", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButton("Couverture");
            },
        });

        fileTable.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableCouverture = new DataTable("#tableCouvertureBd", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("Couverture");
                initButtonDeleteAllDb("couverture");
            },
        });
    }

    if ($("#fileTableNbOpe").length > 0 || $("#tableStatNbOpebd").length > 0) {
        fileTableStatNbOpe = new DataTable("#fileTableNbOpe", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButton("StatNbOpe");
            },
        });

        fileTableStatNbOpe.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableStatNbOpe = new DataTable("#tableStatNbOpebd", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("StatNbOpe");
                initButtonDeleteAllDb("stats_nbope");
            },
        });
    }

    if (
        $("#fileTableCommune").length > 0 ||
        $("#fileTableCommuneData").length > 0
    ) {
        fileTableCommune = new DataTable("#fileTableCommune", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButton("StatCommunes");
            },
        });

        fileTableCommune.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableCommune = new DataTable("#fileTableCommuneData", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("StatCommunes");
                initButtonDeleteAllDb("stat_communes");
            },
        });
    }
    if (
        $("#fileTableDepartement").length > 0 ||
        $("#fileTableDepartementData").length > 0
    ) {
        fileTableDepartement = new DataTable("#fileTableDepartement", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButton("StatDepartements");
            },
        });

        fileTableDepartement.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableDepartement = new DataTable("#fileTableDepartementData", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("StatDepartements");
                initButtonDeleteAllDb("stat_departements");
            },
        });
    }

    if (
        $("#fileTableRegion").length > 0 ||
        $("#fileTableRegionData").length > 0
    ) {
        fileTableRegion = new DataTable("#fileTableRegion", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButton("StatRegions");
            },
        });

        fileTableRegion.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableRegion = new DataTable("#fileTableRegionData", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("StatRegions");
                initButtonDeleteAllDb("stat_regions");
            },
        });
    }
    if (
        $("#fileTableTerritoire").length > 0 ||
        $("#fileTableTerritoireData").length > 0
    ) {
        fileTableTerritoire = new DataTable("#fileTableTerritoire", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButton("StatTerritoires");
            },
        });

        fileTableTerritoire.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableTerritoire = new DataTable("#fileTableTerritoireData", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("StatTerritoires");
                initButtonDeleteAllDb("stat_territoires");
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
    hideErrorMsg("Couverture");
    hideErrorMsg("StatNbOpe");
    hideErrorMsg("StatCommunes");
    hideErrorMsg("StatDepartements");
    hideErrorMsg("StatRegions");
    hideErrorMsg("StatTerritoires");
};

const hideErrorMsg = (id) => {
    $(`#errorSection${id}`).hide();
};

const initModalUpload = () => {
    initUpload("couvertures");
    initUpload("stats_nbope");
    initUpload("stat_communes");
    initUpload("stat_departements");
    initUpload("stat_regions");
    initUpload("stat_territoires");
};

const initUpload = (table) => {
    $(`#upload-btn-${table}`).click(function (event) {
        event.preventDefault();

        $.ajax({
            url: $(this).attr("href"),
            type: "GET",
            dataType: "html",
            success: function (response) {
                var redirectMatch = response.match(/<!--REDIRECT:(.*?)-->/);
                if (redirectMatch) {
                    window.location.href = redirectMatch[1];
                    return;
                }
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
    importButton("Couverture", fileTable);
    importButton("StatNbOpe", fileTableStatNbOpe);
    importButton("StatCommunes", fileTableCommune);
    importButton("StatDepartements", fileTableDepartement);
    importButton("StatRegions", fileTableRegion);
    importButton("StatTerritoires", fileTableTerritoire);
    consolidationButton("Couverture");
    initModalUpload();
});
