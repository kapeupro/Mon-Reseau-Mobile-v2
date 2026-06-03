let fileTable = null,
    dbTable = null,
    fileTableStatsQosDep = null,
    dbTableStatsQosDep = null,
    fileTableQosDensity = null,
    dbTableQosDensity = null,
    fileTableInseeDensity = null,
    dbTableInseeDensity = null,
    fileTableQosStat = null,
    sourceDescTable = null,
    fileTableStatsQosRegions = null,
    fileTableStatsQosMetropole = null;

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
        case "Qos":
            fileTable = fileTable;
            break;
        case "Stats_qos_departements":
            fileTable = fileTableStatsQosDep;
            break;
        case "Qos_density":
            fileTable = fileTableQosDensity;
            break;
        case "Insee_density":
            fileTable = fileTableInseeDensity;
            break;
        case "Qos_stat":
            fileTable = fileTableQosStat;
            break;
        case "Stats_qos_regions":
            fileTable = fileTableStatsQosRegions;
            break;
        case "Stats_qos_metropole":
            fileTable = fileTableStatsQosMetropole;
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

const initButtonConsolidation = (table) => {
    $(`#consolidation_${table}`).on("click", async function () {
        showMessage("Consolidation en cours... (Patientez)");
        const data_post = await postConsolidation(table.toLowerCase());
        hideMessage("Message : " + data_post.msg, data_post.success);
    });
};

const postConsolidation = async (table) => {
    const idConsolidation = `#consolidation_${table}`;
    const urlConsolidation = $(idConsolidation).data("url");

    if (urlConsolidation) {
        const tablename = $(idConsolidation).data("table");
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
            "Attention, toutes les données de la table seront supprimées en base, continuer?",
            lunchDeleteAllDataInBase
        );
    });
};

const initTableQosToImport = () => {
    if ($("#fileTableQosToImport").length > 0 || $("#tableDb").length > 0) {
        fileTable = new DataTable("#fileTableQosToImport", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButton("qos");
            },
        });

        fileTable.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTable = new DataTable("#tableDb", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("qos");
                initButtonDeleteAllDb("qos");
            },
        });
    }
    if (
        $("#fileTableStatQosDepToImport").length > 0 ||
        $("#tableDbStatQosDep").length > 0
    ) {
        fileTableStatsQosDep = new DataTable("#fileTableStatQosDepToImport", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButton("stats_qos_departements");
            },
        });

        fileTableStatsQosDep.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableStatsQosDep = new DataTable("#tableDbStatQosDep", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("stats_qos_departements");
                initButtonDeleteAllDb("stats_qos_departements");
            },
        });
    }
    if (
        $("#fileTableQosDensity").length > 0 ||
        $("#tableDbQosDensity").length > 0
    ) {
        fileTableQosDensity = new DataTable("#fileTableQosDensity", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButton("qos_density");
            },
        });

        fileTableQosDensity.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableQosDensity = new DataTable("#tableDbQosDensity", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("qos_density");
                initButtonDeleteAllDb("qos_density");
            },
        });
    }
    if (
        $("#fileTableInseeDensity").length > 0 ||
        $("#tableDbInseeDensity").length > 0
    ) {
        fileTableInseeDensity = new DataTable("#fileTableInseeDensity", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButton("insee_density");
            },
        });

        fileTableInseeDensity.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableInseeDensity = new DataTable("#tableDbInseeDensity", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("insee_density");
                initButtonDeleteAllDb("insee_density");
            },
        });
    }
    if ($("#fileTableQosStat").length > 0 || $("#tableDbQosStat").length > 0) {
        fileTableQosStat = new DataTable("#fileTableQosStat", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButton("qos_stat");
            },
        });

        fileTableQosStat.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableQosStat = new DataTable("#tableDbQosStat", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("qos_stat");
                initButtonDeleteAllDb("qos_stat");
            },
        });
    }
    
    if ($("#fileTableStatsQosRegions").length > 0 || $("#tableDbStatsQosRegions").length > 0) {
        fileTableStatsQosRegions = new DataTable("#fileTableStatsQosRegions", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButton("stats_qos_regions");
            },
        });

        fileTableStatsQosRegions.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableStatsQosRegions = new DataTable("#tableDbStatsQosRegions", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("stats_qos_regions");
                initButtonDeleteAllDb("stats_qos_regions");
            },
        });
    }

    if ($("#fileTableStatsQosMetropole").length > 0 || $("#tableDbStatsQosMetropole").length > 0) {
        fileTableStatsQosMetropole = new DataTable("#fileTableStatsQosMetropole", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButton("stats_qos_metropole");
            },
        });

        fileTableStatsQosMetropole.on("click", "tbody td:first-child", function (e) {
            $(this).parent().toggleClass("selected");
        });

        dbTableStatsQosMetropole = new DataTable("#tableDbStatsQosMetropole", {
            language: dataTableFrancais,
            drawCallback: function (settings) {
                initButtonDeleteDb("stats_qos_metropole");
                initButtonDeleteAllDb("stats_qos_metropole");
            },
        });
    }
};

const initCrowdFromSource = async () => {
    const url = $("option:selected", "#importOption").data("url");
    if (url) {
        let response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            },
        });

        let data = await response.json();

        if (data.length > 0) {
            $("#dataSourceDesc").editableSelect("destroy");
            $("#dataSourceDesc").empty();
            data.forEach((item) => {
                $("#dataSourceDesc").append(
                    `<option value=${item.id_source_desc}>${item.title_source_desc}</option>`
                );
            });
            $("#dataSourceDesc").editableSelect();
        } else {
            $("#dataSourceDesc").replaceWith(
                `<input type="text" class="form-control" id="dataSourceDesc">`
            );
        }
    }
};

const getCrowdFromSource = () => {
    $(`#importOption`).on("change", async function () {
        const url = $("option:selected", this).data("url");
        if (url) {
            let response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
            });

            let data = await response.json();

            if (data.length > 0) {
                $("#dataSourceDesc").editableSelect("destroy");
                $("#dataSourceDesc").empty();
                data.forEach((item) => {
                    $("#dataSourceDesc").append(
                        `<option value=${item.id_source_desc}>${item.title_source_desc}</option>`
                    );
                });
                $("#dataSourceDesc").editableSelect();
            } else {
                $("#dataSourceDesc").replaceWith(
                    `<input type="text" class="form-control" id="dataSourceDesc">`
                );
            }
        }
    });
};

const postDataImportQos = async (
    filename,
    id_data_source_list,
    label_data_source_desc,
    regionValue
) => {
    let url = $(`#importButtonQos`).data("url");

    let response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
            file: filename,
            id_data_source_list: id_data_source_list,
            label_data_source_desc: label_data_source_desc,
            regionValue: regionValue,
        }),
    });
    let data = await response.json();
    return data;
};

const postDataImport = async (filename, table) => {
    let url = $(`#importButton${table}`).data("url");

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

const importQos = (filename) => {
    initCrowdFromSource();
    getCrowdFromSource();
    $("#importModal").modal("show");
    $("#importModal").on("click", ".btn-secondary", function () {
        $("#importModal").modal("hide");
    });
    $("#importConfirm")
        .off("click")
        .on("click", async function () {
            const label_data_source_desc = $("#dataSourceDesc").val();
            if (label_data_source_desc.trim() == "") {
                popOver(
                    "#dataSourceDesc",
                    "Veuillez insérer ou choisir une description"
                );
                return;
            }

            $("#importModal").modal("hide");

            initLoadingMessage(1);
            let progressBarValue = 0;

            const id_data_source_list = $("#importOption").val();
            const regionValue = $("input[name='region']:checked").val();

            let dataPost = await postDataImportQos(
                filename,
                id_data_source_list,
                label_data_source_desc,
                regionValue
            );
            if (dataPost) {
                let elementReturns = [];

                let element = $("<div>", {
                    class: "alert alert-success",
                }).append(filename + " : " + dataPost.message);
                if (!dataPost.success) {
                    element = $("<div>", {
                        class: "alert alert-danger py-1",
                    }).append(filename + " : " + dataPost.message);
                }
                elementReturns.push(element);

                progressBarValue++;

                $("#message_loading").append(elementReturns);

                // if ($(`#consolidation_qos`).data('table') != "" && dataPost.success && progressBarValue == 1) {
                //     let data_post = await postConsolidation("qos");
                //     let postElement = $("<div>", {
                //         class: "alert",
                //     }).append("Message : " + data_post.msg);
                //     if (!data_post.success){
                //         postElement.removeClass("alert-success").addClass("alert-danger py-1");
                //     }
                //     elementReturns.push(postElement);
                // }

                $("#message_loading").append(elementReturns);

                $("#progressbar").progressbar(
                    "option",
                    "value",
                    progressBarValue
                );

                if (progressBarValue == 1) {
                    hideLoadingMessage();
                }
            }
        });
};

const importFile = async (table, filename) => {
    initLoadingMessage(1);
    let progressBarValue = 0;

    let dataPost = await postDataImport(filename, table);
    if (dataPost) {
        let elementReturn = $("<div>", {
            class: "alert alert-success",
        }).append(filename + " : " + dataPost.message);
        if (!dataPost.success) {
            elementReturn = $("<div>", {
                class: "alert alert-danger py-1",
            }).append(filename + " : " + dataPost.message);
        }

        $("#message_loading").append(elementReturn);

        progressBarValue++;
        $("#progressbar").progressbar("option", "value", progressBarValue);

        if (progressBarValue == 1) {
            hideLoadingMessage();
        }
    }
};

const importFileMultiQos = async () => {
    initCrowdFromSource();
    getCrowdFromSource();
    let selectedFiles = [];
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
                $("#importModal").modal("show");
            };

            ConfirmDialog(
                "Import fichier",
                "Voulez vous importer tous les fichiers?",
                importAllFiles
            );
        } else {
            MessageDialog("Information", "Aucun fichier à importer");
        }
    } else {
        $("#importModal").modal("show");
    }

    $("#importModal").on("click", ".btn-secondary", function () {
        $("#importModal").modal("hide");
    });
    $("#importConfirm")
        .off("click")
        .on("click", async function () {
            const label_data_source_desc = $("#dataSourceDesc").val();
            if (label_data_source_desc.trim() == "") {
                popOver(
                    "#dataSourceDesc",
                    "Veuillez insérer ou choisir une description"
                );
                return;
            }

            $("#importModal").modal("hide");
            const id_data_source_list = $("#importOption").val();
            const regionValue = $("input[name='region']:checked").val();

            initLoadingMessage(selectedFiles.length);
            let progressBarValue = 0;
            for (const filename of selectedFiles) {
                let dataPost = await postDataImportQos(
                    filename,
                    id_data_source_list,
                    label_data_source_desc,
                    regionValue
                );
                if (dataPost) {
                    let elementReturns = [];

                    let element = $("<div>", {
                        class: "alert alert-success",
                    }).append(filename + " : " + dataPost.message);
                    if (!dataPost.success) {
                        const spaceSpecialCharRegex = /[^\w.-]/;
                        if (spaceSpecialCharRegex.test(filename)) {
                            element = $("<div>", {
                                class: "alert alert-danger py-1",
                            }).append(
                                filename + " : Nom de fichier incorrect !"
                            );
                        } else {
                            element = $("<div>", {
                                class: "alert alert-danger py-1",
                            }).append(filename + " : " + dataPost.message);
                        }
                    }
                    elementReturns.push(element);

                    let dataSuccessCount = 0;
                    if (dataPost.success) {
                        dataSuccessCount += 1;
                    }

                    progressBarValue++;
                    $("#message_loading").append(elementReturns);

                    // if ($(`#consolidation_qos`).data('table') != "" && dataSuccessCount > 0 && progressBarValue == selectedFiles.length) {
                    //     let data_post = await postConsolidation("qos");
                    //     let postElement = $("<div>", {
                    //         class: "alert",
                    //     }).append("Message : " + data_post.msg);
                    //     if (!data_post.success){
                    //         postElement.removeClass("alert-success").addClass("alert-danger py-1");
                    //     }
                    //     elementReturns.push(postElement);
                    // }

                    $("#message_loading").append(elementReturns);

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
        });
};

const importFileMulti = async (table) => {
    const runImportProcess = async () => {
        initLoadingMessage(selectedFiles.length);
        let progressBarValue = 0;
        for (const filename of selectedFiles) {
            let dataPost = await postDataImport(filename, table);
            if (dataPost) {
                let elementReturn = $("<div>", {
                    class: "alert alert-success",
                }).append(filename + " : " + dataPost.message);
                if (!dataPost.success) {
                    const spaceSpecialCharRegex = /[^\w.-]/;
                    if (spaceSpecialCharRegex.test(filename)) {
                        elementReturn = $("<div>", {
                            class: "alert alert-danger py-1",
                        }).append(filename + " : Nom de fichier incorrect !");
                    } else {
                        elementReturn = $("<div>", {
                            class: "alert alert-danger py-1",
                        }).append(filename + " : " + dataPost.message);
                    }
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
                "Voulez vous importer tous les fichiers?",
                importAllFiles
            );
        } else {
            MessageDialog("Information", "Aucun fichier à importer");
        }
    } else {
        runImportProcess();
    }
};

const initButton = (table) => {
    $(`.delete_file_${table.toLowerCase()}`).on("click", function () {
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
    $(`.import_file_${table.toLowerCase()}`)
        .off("click")
        .on("click", async function (e) {
            const filename = $(this).data("filename");

            const spaceSpecialCharRegex = /[^\w.-]/;
            if (spaceSpecialCharRegex.test(filename)) {
                $("#errorMsg").text("Nom de fichier incorrect !");
                $("#errorSection").show();
                $(".closeErrorMsg").on("click", function () {
                    $("#errorSection").hide();
                });
            } else {
                if (table.toLowerCase() == "qos") {
                    importQos(filename);
                } else {
                    importFile(table, filename);
                }
            }
        });
};

const importButton = (table) => {
    $(`#importButton${table}`)
        .off("click")
        .on("click", async function () {
            if (table == "Qos") {
                importFileMultiQos();
            } else {
                importFileMulti(table);
            }
        });
};

const initTableSourceDesc = () => {
    sourceDescTable = new DataTable("#listSourceDescToDelete", {
        language: dataTableFrancais,
        paging: false,
        searching: false,
        sorting: false,
        dom: "lrtp",
        drawCallback: function (settings) {
            initButtonDeleteSourceDesc();
        },
    });
};

const launchDeleteSourceDesc = async (url, id_source_desc) => {
    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({ id_source_desc: id_source_desc }),
    });

    const data = await response.json();

    if (data.success) {
        window.location.reload();
    } else {
        $("#errorMessageDeleteSourceDesc").empty();
        $("#errorMessageDeleteSourceDesc").append(
            `<div class="alert alert-danger py-1">${data.message}</div>`
        );
    }
};

const initDataSourceDescTable = () => {
    const fillTable = async (url) => {
        if (url) {
            let response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
            });

            let data = await response.json();

            $("#listSourceDescToDelete tbody").empty();

            data.forEach((item) => {
                $("#listSourceDescToDelete tbody").append(`
                    <tr>
                        <td class="col-10">${item.title_source_desc}</td>
                        <td class="col-2">
                            <button
                                type="button"
                                class="btn btn-sm btn-danger rounded-pill shadow mr-4 delete_source_desc"
                                title="Supprimer le fichier dans le dossier"
                                data-id-source-desc="${item.id_source_desc}"
                            >
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `);
            });

            $("#bodyListSourceDescToDelete").addClass("mh-200 overflow-auto");
        }
    };

    $("#sourceListOption")
        .off("change")
        .on("change", async function () {
            const url = $("option:selected", this).data("url");
            await fillTable(url);
        });

    const initialUrl = $("option:selected", "#sourceListOption").data("url");
    fillTable(initialUrl);
};

const initButtonDeleteSourceDesc = () => {
    $("#deleteDataSourceDescButtonQos")
        .off("click")
        .on("click", function () {
            initDataSourceDescTable();
            $("#deleteSourceDescModal").modal("show");
            $("#deleteSourceDescModal").on(
                "click",
                ".btn-secondary",
                function () {
                    $("#deleteSourceDescModal").modal("hide");
                }
            );
            $("#listSourceDescToDelete")
                .off("click")
                .on("click", ".delete_source_desc", function () {
                    const id_source_desc = $(this).data("id-source-desc");
                    const deleteUrl = $("#listSourceDescToDelete").data("url");

                    $("#confirmationSection").modal("show");

                    $(document)
                        .off("click", "#confirmDeleteButton")
                        .on("click", "#confirmDeleteButton", function () {
                            launchDeleteSourceDesc(deleteUrl, id_source_desc);
                        });

                    $(document)
                        .off("click", "#cancelDeleteButton")
                        .on("click", "#cancelDeleteButton", function () {
                            $("#confirmationSection").modal("hide");
                        });
                });
        });
};

const initButtons = () => {
    initButton("Qos");
    initButton("Stats_qos_departements");
    initButton("Qos_density");
    initButton("Insee_density");
    initButton("Qos_stat");
    initButton("Stats_qos_regions");
    initButton("Stats_qos_metropole");

    initButtonConsolidation("qos");
};

const initimportButtons = () => {
    importButton("Qos");
    importButton("Stats_qos_departements");
    importButton("Qos_density");
    importButton("Insee_density");
    importButton("Qos_stat");
    importButton("Stats_qos_regions");
    importButton("Stats_qos_metropole");
};

const initModalUpload = () => {
    initUpload("qos");
    initUpload("stats_qos_departements");
    initUpload("qos_density");
    initUpload("insee_density");
    initUpload("qos_stat");
    initUpload("stats_qos_regions");
    initUpload("stats_qos_metropole");
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
    initTableQosToImport();
    initTableSourceDesc();
    initButtonDeleteSourceDesc();
    initButtons();
    initimportButtons();
    initModalUpload();
});
