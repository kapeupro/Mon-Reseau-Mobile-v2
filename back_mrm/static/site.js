let fileTableSite = null,
    fileTableSiteAvenir = null,
    dbTableSite = null,
    dbTableSiteAvenir = null,
    fileTableNature = null,
    dbTableNature = null,
    fileTableStation = null,
    dbTableStation = null,
    fileTableBande = null,
    dbTableBande = null,
    fileTableAntenne = null,
    dbTableAntenne = null,
    fileTableSupport = null,
    dbTableSupport = null,
    fileTableEmetteur = null,
    dbTableEmetteur = null,
    fileTableEmetteurLink = null,
    dbTableEmetteurLink = null;

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
                    cookie.substring(name.length + 1),
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
        case "Site":
            fileTable = fileTableSite;
            break;
        case "SiteAvenir":
            fileTable = fileTableSiteAvenir;
            break;
        case "Nature":
            fileTable = fileTableNature;
            break;
        case "Station":
            fileTable = fileTableStation;
            break;
        case "Bande":
            fileTable = fileTableBande;
            break;
        case "Antenne":
            fileTable = fileTableAntenne;
            break;
        case "Support":
            fileTable = fileTableSupport;
            break;
        case "Emetteur":
            fileTable = fileTableEmetteur;
            break;
        case "EmetteurLink":
            fileTable = fileTableEmetteurLink;
            break;
        default:
            console.error("Table name not recognized");
            return;
    }

    return fileTable;
};

const initLoadingMessage = (maxValue, isstation = false) => {
    let progressbar = $("#progressbar"),
        progressLabel = $(".progress-label");

    if (!isstation) {
        $("body").addClass("loading");
        $(".modalFooter").hide();
        $("#loadingModal").modal("show");

        $("#message_loading").html();
    }

    progressLabel.text("Chargement en cours...");
    $("#progressbar").progressbar({
        max: maxValue,
        value: 0,
        change: function () {
            progressLabel.text(
                progressbar.progressbar("value") + "/" + maxValue,
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

const postConsolidation = async (table, is_site = false) => {
    let progressLabel = $(".progress-label");
    progressLabel.text("Consolidation des données ... (Patientez)");
    const idConsolidation = `#consolidation_${table}`;
    const urlConsolidation = $(idConsolidation).data("url");

    if (urlConsolidation) {
        let tablename = $(idConsolidation).data("table");
        if (is_site) {
            tablename = $(idConsolidation).data("tableconsolide");
        }
        let response = await fetch(`${urlConsolidation}?table=${tablename}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            },
        });
        let data = await response.json();

        return data;
    }
};

const messageImport = async (
    table,
    dataResponse,
    filename,
    selectedFilesLength,
    progressBarValue,
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

    let dataSuccessCount = 0;
    if (dataResponse.success) {
        dataSuccessCount += 1;
    }

    $("#message_loading").append(elementReturns);

    if (table.toLowerCase() === "station") {
        if (
            $(`#consolidation_${table}`).data("table") != "" &&
            dataSuccessCount > 0 &&
            progressBarValue == selectedFilesLength
        ) {
            let data_post = await postConsolidation(table.toLowerCase());
            let postElement = $("<div>", {
                class: "alert",
            }).append("Message : " + data_post.msg);
            if (!data_post.success) {
                postElement
                    .removeClass("alert-success")
                    .addClass("alert-danger py-1");
            }
            elementReturns.push(postElement);
        }
    }

    $("#message_loading").append(elementReturns);

    $("#progressbar").progressbar("option", "value", progressBarValue);

    if (progressBarValue == selectedFilesLength) {
        hideLoadingMessage();
    }
};

const initTables = () => {
    initTableSite();
    initTableSiteAvenir();
    initTableNature();
    initTableStation();
    initTableEmetteurLink();
};

const initButtonConsolidation = (table) => {
    $(`#consolidation_${table}`).on("click", function () {
        const lunchConsolidation = async () => {
            showMessage("Consolidation en cours... (Patientez)");
            const data_post = await postConsolidation(
                table.toLowerCase(),
                true,
            );
            hideMessage("Message : " + data_post.msg, data_post.success);
        };

        ConfirmDialog(
            "Consolidation",
            `Cette consolidation permettra de : <br />
                1- calculer la géométrie des sites <br />
                2- de consolider du champ sup_id <br />
                3- de supprimer les doublons sur les anfr_sup_support <br />
                4- de supprimer les supports qui n'ont pas de site associé <br />
                5- de mettre à jour les statistiques des sites sur les communes, départements et régions. <br /> <br />
                Il est fortement recommandé de terminer tous les imports nature, site et Station-Bande-Antenne-Support-Emetteur avant de le lancer.<br />
                Souhaitez-vous poursuivre la consolidation ?`,
            lunchConsolidation,
        );
    });
};

const initButtonsImport = () => {
    initButtonImport("Site");
    initButtonImport("SiteAvenir");
    initButtonImport("Nature");
    initButtonImport("Station");
    initButtonImport("EmetteurLink");
    initButtonConsolidation("site");
    initButtonConsolidation("station");
};

const initDeleteAllTableStation = () => {
    initButtonDeleteAllTableStation("station");
};

const initTableSite = () => {
    if ($(`#fileTableSite`).length > 0 || $(`#dbTableSite`).length > 0) {
        fileTableSite = new DataTable(`#fileTableSite`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteFile("site");
            },
        });

        fileTableSite.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableSite = new DataTable(`#dbTableSite`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("site");
                initButtonDeleteAllDb("site");
            },
        });
    }
};

const initTableSiteAvenir = () => {
    if (
        $(`#fileTableSiteAvenir`).length > 0 ||
        $(`#dbTableSiteAvenir`).length > 0
    ) {
        fileTableSiteAvenir = new DataTable(`#fileTableSiteAvenir`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteFile("site_a_venir");
            },
        });

        fileTableSiteAvenir.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableSiteAvenir = new DataTable(`#dbTableSiteAvenir`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("site_a_venir");
                initButtonDeleteAllDb("site_a_venir");
            },
        });
    }
};

const initTableNature = () => {
    if ($(`#fileTableNature`).length > 0 || $(`#dbTableNature`).length > 0) {
        fileTableNature = new DataTable(`#fileTableNature`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteFile("nature");
            },
        });

        fileTableNature.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableNature = new DataTable(`#dbTableNature`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("nature");
            },
        });
    }
};

const initTableStation = () => {
    if ($(`#fileTableStation`).length > 0 || $(`#dbTableStation`).length > 0) {
        fileTableStation = new DataTable(`#fileTableStation`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteFile("station");
            },
        });

        fileTableStation.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableStation = new DataTable(`#dbTableStation`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("station");
                initButtonDeleteAllDb("station");
            },
        });
    }

    if ($(`#fileTableBande`).length > 0 || $(`#dbTableBande`).length > 0) {
        fileTableBande = new DataTable(`#fileTableBande`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteFile("bande");
            },
        });

        fileTableBande.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableBande = new DataTable(`#dbTableBande`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("bande");
                initButtonDeleteAllDb("bande");
            },
        });
    }

    if ($(`#fileTableAntenne`).length > 0 || $(`#dbTableAntenne`).length > 0) {
        fileTableAntenne = new DataTable(`#fileTableAntenne`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteFile("antenne");
            },
        });

        fileTableAntenne.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableAntenne = new DataTable(`#dbTableAntenne`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("antenne");
                initButtonDeleteAllDb("antenne");
            },
        });
    }

    if ($(`#fileTableSupport`).length > 0 || $(`#dbTableSupport`).length > 0) {
        fileTableSupport = new DataTable(`#fileTableSupport`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteFile("support");
            },
        });

        fileTableSupport.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableSupport = new DataTable(`#dbTableSupport`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("support");
                initButtonDeleteAllDb("support");
            },
        });
    }

    if (
        $(`#fileTableEmetteur`).length > 0 ||
        $(`#dbTableEmetteur`).length > 0
    ) {
        fileTableEmetteur = new DataTable(`#fileTableEmetteur`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteFile("emetteur");
            },
        });

        fileTableEmetteur.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableEmetteur = new DataTable(`#dbTableEmetteur`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("emetteur");
                initButtonDeleteAllDb("emetteur");
            },
        });
    }
};

const initTableEmetteurLink = () => {
    if (
        $(`#fileTableEmetteurLink`).length > 0 ||
        $(`#dbTableEmetteurLink`).length > 0
    ) {
        fileTableEmetteurLink = new DataTable(`#fileTableEmetteurLink`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteFile("emetteurlink");
            },
        });

        fileTableEmetteurLink.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableEmetteurLink = new DataTable(`#dbTableEmetteurLink`, {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("emetteurlink");
                initButtonDeleteAllDb("emetteurlink");
            },
        });
    }
};

const importFile = async (url, filename, zip_filename_sabes = "") => {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
            files: filename,
            file_sabes: zip_filename_sabes,
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
    $(`.delete_db_${table}`).on("click", function () {
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
                        false,
                    ),
                );
        };

        ConfirmDialog(
            "suppression des données en base",
            "Les données seront supprimées en base, continuer",
            lunchDeleteDataInBase,
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
                        hideMessage("Suppression terminée !", true);
                    }
                })
                .catch((error) =>
                    hideMessage(
                        `Erreur lors de la suppression : ${error}`,
                        false,
                    ),
                );
        };

        ConfirmDialog(
            "suppression des données en base",
            "Attention, toutes les données de la table seront supprimées en base, continuer?",
            lunchDeleteAllDataInBase,
        );
    });
};

const initButtonDeleteAllTableStation = (table) => {
    $(`#deleteAllTable_${table}`).on("click", function () {
        const lunchDeleteAllDataInBase = () => {
            showMessage("Suppression en cours...");
            const url = $(this).data("url");

            const fullurl = `${url}`;
            fetch(fullurl, {
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
                        false,
                    ),
                );
        };

        ConfirmDialog(
            "suppression des données en base",
            "Attention, toutes les données de la table station, bande, antenne, support et emetteur seront supprimées en base, continuer?",
            lunchDeleteAllDataInBase,
        );
    });
};

const get_csv_file_list = async (url, filename) => {
    const fullurl = `${url}?filename=${filename}&data_type=stations`;

    try {
        const response = await fetch(fullurl);
        if (!response.ok) {
            throw new Error("Erreur lors de l'execution de la tache");
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.log(`Erreur : ${error}`);
        return [];
    }
};

const pollUntilIsFileGenerated = async (table, csvFileList) => {
    const checkUrl = $(`#importButton${table}`).data("isfilegenerated");
    if (!checkUrl) {
        return;
    }

    // ✅ Référence directe à l'élément pour les mises à jour
    const pollMessage = $("<div>", {
        class: "alert alert-info",
        id: "poll-message",
    }).text(`Vérification de l'existence des fichiers avant le traitement...`);

    $("#message_loading").append(pollMessage).append($("<div>", { class: "mt-1" }));

    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
        attempts++;

        // ✅ Mise à jour immédiate avant l'attente
        pollMessage.text(`Vérification des fichiers... (${attempts}/${maxAttempts})`);

        try {
            const data = await $.ajax({
                url: checkUrl,
                method: "GET",
                data: {
                    data_type: "stations",
                    files: csvFileList.join(","),
                },
                dataType: "json",
            });

            if (data.success === true) {
                $("#message_loading").empty();
                return;
            }
        } catch (error) {
            console.error(`Erreur lors de la vérification : ${error}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 10000));
    }

    // ✅ Timeout atteint
    pollMessage
        .removeClass("alert-info")
        .addClass("alert-danger")
        .text("Délai d'attente dépassé. Veuillez réessayer.");
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
                    alert("Erreur lors de la suppression : ", error),
                );
        };

        ConfirmDialog(
            "suppression fichier",
            "Le fichier sera supprimé, continuer?",
            lunchDeleteFile,
        );
    });
};

const initButtonImport = (table) => {
    $(`#importButton${table}`)
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

        const url = $(`#importButton${table}`).data("url");

        let progressBarOtherStationValue = 1;
        for (const filename of selectedFiles) {
            if (table.toLowerCase() === "station") {
                $("body").addClass("loading");
                $(".modalFooter").hide();
                $("#loadingModal").modal("show");
                $(".progress-label").text("Traitement du fichier en cours...");

                const preurl = $(`#importButton${table}`).data("preurl");
                const csv_file_list_result = await get_csv_file_list(
                    preurl,
                    filename,
                );

                if (!csv_file_list_result.success) {
                    $(".progress-label")
                        .text(csv_file_list_result.msg)
                        .css("color", "red");
                    $(".modalFooter").show();
                    $("#closeModal").on("click", function () {
                        $("body").removeClass("loading");
                        $("#loadingModal").modal("hide");
                    });

                    return;
                }

                const csv_file_list = csv_file_list_result.csv_file_list;

                await pollUntilIsFileGenerated(table, csv_file_list);

                initLoadingMessage(csv_file_list.length, true);
                let progressBarValue = 1;

                for (const file of csv_file_list) {
                    const dataResponse = await importFile(url, file, filename);
                    messageImport(
                        table,
                        dataResponse,
                        file,
                        csv_file_list.length,
                        progressBarValue,
                    );
                    progressBarValue++;
                }
            } else {
                initLoadingMessage(selectedFiles.length);
                const dataResponse = await importFile(url, filename);
                messageImport(
                    table,
                    dataResponse,
                    filename,
                    selectedFiles.length,
                    progressBarOtherStationValue,
                );
                progressBarOtherStationValue++;
            }
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
                importAllFiles,
            );
        } else {
            MessageDialog("Information", "Aucun fichier à importer");
        }
    } else {
        runImportProcess();
    }
};

const importSingleScript = async (table, filename) => {
    const url = $(`#importButton${table}`).data("url");

    const spaceSpecialCharRegex = /[^\w.-]/;
    if (spaceSpecialCharRegex.test(filename)) {
        $(`#errorMsg${table.toLowerCase()}`).text("Nom de fichier incorrect !");
        $(`#errorSection${table.toLowerCase()}`).show();
        $(`.closeErrorMsg${table.toLowerCase()}`).on("click", function () {
            hideErrorMsg(table.toLowerCase());
        });
    } else {
        if (table.toLowerCase() === "station") {
            $("body").addClass("loading");
            $(".modalFooter").hide();
            $("#loadingModal").modal("show");
            $(".progress-label").text("Traitement du fichier en cours...");

            const preurl = $(`#importButton${table}`).data("preurl");
            const csv_file_list_result = await get_csv_file_list(
                preurl,
                filename,
            );

            if (!csv_file_list_result.success) {
                $(".progress-label")
                    .text(csv_file_list_result.msg)
                    .css("color", "red");
                $(".modalFooter").show();
                $("#closeModal").on("click", function () {
                    $("body").removeClass("loading");
                    $("#loadingModal").modal("hide");
                });

                return;
            }

            const csv_file_list = csv_file_list_result.csv_file_list;

            await pollUntilIsFileGenerated(table, csv_file_list);

            initLoadingMessage(csv_file_list.length, true);
            let progressBarValue = 1;

            for (const file of csv_file_list) {
                const dataResponse = await importFile(url, file, filename);
                messageImport(
                    table,
                    dataResponse,
                    file,
                    csv_file_list.length,
                    progressBarValue,
                );
                progressBarValue++;
            }
        } else {
            initLoadingMessage(1);
            let progressBarValue = 1;

            const dataResponse = await importFile(url, filename);
            messageImport(table, dataResponse, filename, 1, progressBarValue);
        }
    }
};

const initErrorMsg = () => {
    hideErrorMsg("site");
    hideErrorMsg("nature");
    hideErrorMsg("station");
    hideErrorMsg("emetteurlink");
};

const hideErrorMsg = (id) => {
    $(`#errorSection${id}`).hide();
};

const initModalUpload = () => {
    initUpload("sites");
    initUpload("natures");
    initUpload("stations");
    initUpload("emetteurs_link");
    initUpload("sites-avenir");
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
                                "An error occurred while uploading the files.",
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
    initDeleteAllTableStation();
    initModalUpload();
});
