let fileTableZacPoi = null,
    dbTableZacPoi = null,
    fileTableZacSite = null,
    dbTableZacSite = null,
    fileTableZacRfr = null,
    dbTableZacRfr = null,
    fileTableZacArp = null,
    dbTableZacArp = null,
    fileTableZacArp5g = null,
    dbTableZacArp5g = null;

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

const getFileTableName = (table) => {
    let fileTable = null;

    switch (table) {
        case "zac_poi":
            fileTable = fileTableZacPoi;
            break;
        case "zac_site":
            fileTable = fileTableZacSite;
            break;
        case "zac_axe_ferre":
            fileTable = fileTableZacRfr;
            break;
        case "zac_axe_routier_prioritaire":
            fileTable = fileTableZacArp;
            break;
        case "zac_axe_routier_prioritaire_5g":
            fileTable = fileTableZacArp5g;
            break;
        default:
            console.error("Table name not recognized");
            return;
    }

    return fileTable;
};

const initLoadingMessage = (maxValue) => {
    let progressbar = $("#progressbar"),
        progressLabel = $(".progress-label");

    $("body").addClass("loading");
    $(".modalFooter").hide();
    $("#loadingModal").modal("show");

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

const messageImport = async (
    dataResponse,
    filename,
    selectedFilesLength,
    progressBarValue
) => {
    let elementReturns = [];

    let element = $("<div>", {
        class: "alert alert-success",
    }).append(filename + " : " + dataResponse.message);

    if (!dataResponse.success) {
        const spaceSpecialCharRegex = /[^\w.-]/;
        let errorMessage = filename + " : " + dataResponse.message;
        if (spaceSpecialCharRegex.test(filename)) {
            errorMessage = filename + " : Nom de fichier incorrect !";
        }
        element = $("<div>", {
            class: "alert alert-danger py-1",
        }).append(errorMessage);
    }
    elementReturns.push(element);

    $("#message_loading").append(elementReturns);

    $("#progressbar").progressbar("option", "value", progressBarValue);

    if (progressBarValue == selectedFilesLength) {
        hideLoadingMessage();
    }
};

const initTables = () => {
    if ($(`#fileTableZacPoi`).length > 0 || $(`#dbTableZacPoi`).length > 0) {
        fileTableZacPoi = new DataTable(`#fileTableZacPoi`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteFile("zac_poi");
            },
        });

        fileTableZacPoi.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableZacPoi = new DataTable(`#dbTableZacPoi`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("zac_poi");
                initButtonDeleteAllDb("zac_poi");
            },
        });
    }

    if ($(`#fileTableZacSite`).length > 0 || $(`#dbTableZacSite`).length > 0) {
        fileTableZacSite = new DataTable(`#fileTableZacSite`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteFile("zac_site");
            },
        });

        fileTableZacSite.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableZacSite = new DataTable(`#dbTableZacSite`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("zac_site");
                initButtonDeleteAllDb("zac_site");
            },
        });
    }

    if (
        $(`#fileTableZacAxeFerre`).length > 0 ||
        $(`#dbTableZacAxeFerre`).length > 0
    ) {
        fileTableZacRfr = new DataTable(`#fileTableZacAxeFerre`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteFile("zac_axe_ferre");
            },
        });

        fileTableZacRfr.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableZacRfr = new DataTable(`#dbTableZacAxeFerre`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("zac_axe_ferre");
                initButtonDeleteAllDb("zac_axe_ferre");
            },
        });
    }

    if (
        $(`#fileTableZacAxeRoutierPrioritaire`).length > 0 ||
        $(`#dbTableZacAxeRoutierPrioritaire`).length > 0
    ) {
        fileTableZacArp = new DataTable(`#fileTableZacAxeRoutierPrioritaire`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteFile("zac_axe_routier_prioritaire");
            },
        });

        fileTableZacArp.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableZacArp = new DataTable(`#dbTableZacAxeRoutierPrioritaire`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("zac_axe_routier_prioritaire");
                initButtonDeleteAllDb("zac_axe_routier_prioritaire");
            },
        });
    }

    if (
        $(`#fileTableZacAxeRoutierPrioritaire5g`).length > 0 ||
        $(`#dbTableZacAxeRoutierPrioritaire5g`).length > 0
    ) {
        fileTableZacArp5g = new DataTable(
            `#fileTableZacAxeRoutierPrioritaire5g`,
            {
                language: dataTableFrancais,
                drawCallback: function (settings) {
                    initButtonDeleteFile("zac_axe_routier_prioritaire_5g");
                },
            }
        );

        fileTableZacArp5g.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableZacArp5g = new DataTable(`#dbTableZacAxeRoutierPrioritaire5g`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("zac_axe_routier_prioritaire_5g");
                initButtonDeleteAllDb("zac_axe_routier_prioritaire_5g");
            },
        });
    }
};

const initButtonsImport = () => {
    initButtonImport("zac_poi");
    initButtonImport("zac_site");
    initButtonImport("zac_axe_ferre");
    initButtonImport("zac_axe_routier_prioritaire");
    initButtonImport("zac_axe_routier_prioritaire_5g");
};

const importFile = async (url, filename) => {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
            files: filename,
        }),
    });

    const data = await response.json();
    return data;
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
    $(`.delete_bd_${table}`).on("click", function () {
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
                        if (table === "zac_poi" || table === "zac_site") {
                            const url_op = $(this).data("urlop");
                            fetch(url_op, {
                                method: "DELETE", // Method itself
                                headers: {
                                    "Content-type":
                                        "application/json; charset=UTF-8", // Indicates the content
                                    "X-CSRFToken": getCookie("csrftoken"),
                                },
                            })
                                .then((response) => {
                                    if (response.ok) {
                                        hideMessage(
                                            "Suppression terminée !",
                                            true
                                        );
                                    }
                                })
                                .catch((error) =>
                                    hideMessage(
                                        `Erreur lors de la suppression : ${error}`,
                                        false
                                    )
                                );
                        } else {
                            hideMessage("Suppression terminée !", true);
                        }
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
            "Les données seront supprimées en base, continuer",
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
                method: "DELETE", // Method itself
                headers: {
                    "Content-type": "application/json; charset=UTF-8", // Indicates the content
                    "X-CSRFToken": getCookie("csrftoken"),
                },
            })
                .then((response) => {
                    if (response.ok) {
                        if (table === "zac_poi" || table === "zac_site") {
                            const tablename_op = $(this).data("tablenameop");
                            const typeop = $(this).data("typeop");
                            const fullurlop = `${url}?table=${tablename_op}&type=${typeop}`;

                            fetch(fullurlop, {
                                method: "DELETE", // Method itself
                                headers: {
                                    "Content-type":
                                        "application/json; charset=UTF-8", // Indicates the content
                                    "X-CSRFToken": getCookie("csrftoken"),
                                },
                            })
                                .then((response) => {
                                    if (response.ok) {
                                        hideMessage(
                                            "Suppression terminée !",
                                            true
                                        );
                                    }
                                })
                                .catch((error) =>
                                    hideMessage(
                                        `Erreur lors de la suppression : ${error}`,
                                        false
                                    )
                                );
                        } else {
                            hideMessage("Suppression terminée !", true);
                        }
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

const initButtonDeleteFile = (table) => {
    $(`.delete_file_${table}`).on("click", function () {
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
};

const initButtonImport = (table) => {
    $(`#importButton_${table}`)
        .off("click")
        .on("click", function () {
            importScript(table);
        });
    $(`.import_file_${table.toLowerCase()}`)
        .off("click")
        .on("click", function () {
            const filename = $(this).data("filename");

            importSingleScript(table, filename);
        });
};

const importScript = (table) => {
    const runImportProcess = async () => {
        $("#importModal").modal("show");

        $("#importModal").on("click", ".btn-secondary", function () {
            $("#importModal").modal("hide");
        });

        const url = $(`#importButton_${table}`).data("url");

        initLoadingMessage(selectedFiles.length);
        let progressBarValue = 1;

        for (const filename of selectedFiles) {
            const dataResponse = await importFile(url, filename);
            messageImport(
                dataResponse,
                filename,
                selectedFiles.length,
                progressBarValue
            );
            progressBarValue++;
        }
    };

    let selectedFiles = [];
    const fileTable = getFileTableName(table);
    let selectedRows;
    if (fileTable != null) {
        selectedRows = fileTable.rows(".selected").data().toArray();
    } else {
        MessageDialog("Information", "Aucun fichier à importer");
        return;
    }
    selectedFiles = selectedRows.map((row) => row[0]);

    if (selectedFiles.length == 0) {
        if (fileTable.settings().length > 0) {
            if (fileTable.settings()[0].oPreviousSearch.sSearch !== "") {
                selectedRows = fileTable
                    .rows({ search: "applied" })
                    .data()
                    .toArray();
            } else {
                selectedRows = fileTable.rows().data().toArray();
            }
            selectedFiles = selectedRows.map((row) => row[0]);
            const importAllFiles = () => {
                runImportProcess();
            };

            ConfirmDialog(
                "Import fichier",
                "Voulez-vous importer tous les fichiers?",
                importAllFiles
            );
        } else {
            MessageDialog("Information", "Aucun fichier à importer");
        }
    } else {
        runImportProcess();
    }
};

const importSingleScript = async (table, filename) => {
    $("#importModal").modal("show");

    $("#importModal").on("click", ".btn-secondary", function () {
        $("#importModal").modal("hide");
    });

    const url = $(`#importButton_${table}`).data("url");

    const spaceSpecialCharRegex = /[^\w.-]/;
    if (spaceSpecialCharRegex.test(filename)) {
        $(`#errorMsg${table.toLowerCase()}`).text("Nom de fichier incorrect !");
        $(`#errorSection${table.toLowerCase()}`).show();
        $(`.closeErrorMsg${table.toLowerCase()}`).on("click", function () {
            hideErrorMsg(table.toLowerCase());
        });
    } else {
        initLoadingMessage(1);
        let progressBarValue = 1;

        const dataResponse = await importFile(url, filename);
        messageImport(dataResponse, filename, 1, progressBarValue);
    }
};

const initErrorMsg = () => {
    hideErrorMsg("zac_poi");
    hideErrorMsg("zac_site");
    hideErrorMsg("zac_axe_ferre");
    hideErrorMsg("zac_axe_routier_prioritaire");
    hideErrorMsg("zac_axe_routier_prioritaire_5g");
};

const hideErrorMsg = (id) => {
    $(`#errorSection${id}`).hide();
};

const initModalUpload = () => {
    initUpload("zac_poi");
    initUpload("zac_site");
    initUpload("zac_rfr");
    initUpload("zac_arp");
    initUpload("zac_arp_5g");
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
    initTables();
    initErrorMsg();
    initButtonsImport();
    initModalUpload();
});
