const popOver = (element, message) => {
    const hidePopover = () => {
        //$(element).popover("hide");
        // $(element).off("click", hidePopover);
        // $(".popover").off("click", hidePopover);
    };

    $(element).popover({
        content: message,
        //placement: "right",
        trigger: "focus",
        html: true,
    });

    if (!$(".popover").is(":visible")) {
        //$(element).popover("show");
        // $(".popover").on("click", hidePopover);
    } else {
        hidePopover();
    }
};

const initInfoButton = (table) => {
    const info = getInfo(table);
    $(`.info_button_${table.toLowerCase()}`)
        .popover({
            content: info,
            trigger: "focus",
            html: true,
            container: "body",
        })
        .on("click", function () {
            $(this).popover("toggle");
        });
    // $(`.info_button_${table.toLowerCase()}`)
    //     .off("click")
    //     .on("click", function () {
    //         const info = getInfo(table);
    //         popOver(this, info);
    //     });
};

const getInfo = (table) => {
    let info = "Aucune info";
    switch (table) {
        case "couverture":
            info =
                "<b>Durée</b> : ~ 3min par fichier</br>" +
                "<b>Format</b> : gpkg</br>" +
                "<b>Source</b> : fichiers gpkg de couverture fournis par l’ARCEP.</br>" +
                "<b>Exemple</b> : 2023_T2_couv_Metropole_SFR0_2G3G_voix.gpkg</br>";
            break;
        case "stat_nbope":
            info =
                "<b>Durée</b> : ~ 1min</br>" +
                "<b>Format</b> : csv</br>" +
                "<b>Source</b> : fichiers csv de statistiques nbope par communes, départements, régions et territoires fournis par l’ARCEP.</br>" +
                "<b>Exemple</b> : 2023T3_nbope_communes.csv</br>" +
                '<i>"techno";"niveau";"territoire";"pop_0";"pop_1";"pop_2";"pop_3";"pop_4";"pop_5";"couv_0";"couv_1";"couv_2";"couv_3";"couv_4";"couv_5"</br>' +
                '"2G3G";"BC";"METRO";0.04;0.05;0.25;0.70;98.95;"";3.08;2.07;4.66;6.63;83.56;""</i>';
            break;
        case "stat_commune":
            info =
                "<b>Durée</b> : ~ 2min</br>" +
                "<b>Format</b> : csv</br>" +
                "<b>Source</b> : fichiers csv de statistiques op par communes fourni par l’ARCEP.</br>" +
                "<b>Exemple</b> : 2023T3_op_communes.csv</br>" +
                '<i>"techno";"mcc_mnc";"commune";"couv_nc";"couv_cl";"couv_bc";"couv_tbc";"pop_nc";"pop_cl";"pop_bc";"pop_tbc"</br>' +
                '"2G";20801;"01001";0.18;4.48;69.08;26.26;0.00;14.72;78.38;6.91</i>';
            break;
        case "stat_departement":
            info =
                "<b>Durée</b> : < 1min</br>" +
                "<b>Format</b> : csv</br>" +
                "<b>Source</b> : fichiers csv de statistiques op par départements fourni par l’ARCEP.</br>" +
                "<b>Exemple</b> : 2023T3_op_departements.csv</br>" +
                '<i>"techno";"mcc_mnc";"departement";"couv_nc";"couv_cl";"couv_bc";"couv_tbc";"pop_nc";"pop_cl";"pop_bc";"pop_tbc"</br>' +
                '"2G";20801;"01";4.33;11.88;35.67;48.12;0.66;2.66;17.42;79.27</i>';
            break;
        case "stat_region":
            info =
                "<b>Durée</b> : < 1min</br>" +
                "<b>Format</b> : csv</br>" +
                "<b>Source</b> : fichiers csv de statistiques op par régions fourni par l’ARCEP.</br>" +
                "<b>Exemple</b> : 2023T3_op_regions.csv</br>" +
                '<i>"techno";"mcc_mnc";"region";"couv_nc";"couv_cl";"couv_bc";"couv_tbc";"pop_nc";"pop_cl";"pop_bc";"pop_tbc"</br>' +
                '"2G";20801;"11";0.58;2.82;19.95;76.65;0.05;0.26;3.18;96.51</i>';
            break;
        case "stat_territoire":
            info =
                "<b>Durée</b> :< 1min</br>" +
                "<b>Format</b> : csv</br>" +
                "<b>Source</b> : fichier csv de statistiques op par territoires fourni par l’ARCEP.</br>" +
                "<b>Exemple</b> : 2023T3_op_territoires.csv</br>" +
                '<i>"techno";"mcc_mnc";"territoire";"couv_nc";"couv_cl";"couv_bc";"couv_tbc";"pop_nc";"pop_cl";"pop_bc";"pop_tbc"</br>' +
                '"2G";20801;"METRO";5.58;7.74;32.80;53.88;0.39;1.50;10.72;87.39</i>';
            break;
        case "stats_qos_departements":
            info =
                "<b>Durée</b> :< 1min</br>" +
                "<b>Format</b> : csv</br>" +
                "<b>Source</b> : fichier csv de statistiques qualité par départements fourni par l’ARCEP.</br>" +
                "<b>Info</b> : Champs à modifier dans fichier Qos_stat_template.csv : 'service' en 'protocole', 'mccmnc' en 'mcc_mnc'.</br>" +
                "<b>Exemple</b> : QoS_stat_template.csv</br>" +
                "<i>nom_region;insee_dep;protocole;mcc_mnc;resultat;nb_test</br>" +
                "Auvergne-Rhône-Alpes;01;WEB;20820;;</i>";
            break;
        case "qos_density":
            info =
                "<b>Durée</b> :< 1min</br>" +
                "<b>Format</b> : csv</br>" +
                "<b>Source</b> : fichier indiquant les résultats de QoS par strates (touristiques, denses, rurales, etc.), par opérateur et par type de test. </br>" +
                "<b>Exemple</b> : qos_density.csv</br>" +
                "<i>protocole;zone;mcc_mnc;label;result</br>" +
                "SMS;zones denses;20801;Le pourcentage de succès au test SMS pour Orange dans ce type de zone est de : ;99%</i>";
            break;
        case "insee_density":
            info =
                "<b>Durée</b> :< 1min</br>" +
                "<b>Format</b> : csv</br>" +
                "<b>Source</b> : fichier csv des infos de densité par communes fourni par l'INSEE et transformé par l’ARCEP. <a href='https://www.insee.fr/fr/information/6439600' target='_blank'>lien INSEE</a></br>" +
                "<b>Exemple</b> : insee_density.csv</br>" +
                "<b>Info</b> : Champ à modifier dans fichier insee_density.csv : 'CODGEO' en 'CODEGEO'.</br>" +
                "<i>CODEGEO;DENS;LIBDENS;TOURISTIC_ZONES</br>" +
                "1001;6;Rural à habitat dispersé;0</i>";
            break;
        case "qos_stat":
            info =
                "<b>Durée</b> :< 1min</br>" +
                "<b>Format</b> : csv</br>" +
                "<b>Source</b> : fichier csv des stats Qos par départements fourni par l’ARCEP</br>" +
                "<b>Exemple</b> : 2023_QoS_agregate.csv</br>" +
                "<i>nom_region;insee_dep;service;zone;situation;mccmnc;resultat;nb_test</br>" +
                "Auvergne-Rhône-Alpes;01;WEB;all;all;20820;63.51851851851852;540.0</i>";
            break;
        case "stats_qos_regions":
            info =
                "<b>Durée</b> :< 1min</br>" +
                "<b>Format</b> : csv</br>" +
                "<b>Source</b> : fichier csv des stats Qos par régions fourni par l’ARCEP</br>" +
                "<b>Exemple</b> : 2023_QoS_agregate.csv</br>" +
                "<i>nom_region;insee_reg;service;zone;situation;mccmnc;resultat;nb_test</br>" +
                "Auvergne-Rhône-Alpes;01;WEB;all;all;20820;63.51851851851852;540.0</i>";
            break;
        case "stats_qos_metropole":
            info =
                "<b>Durée</b> :< 1min</br>" +
                "<b>Format</b> : csv</br>" +
                "<b>Source</b> : fichier csv des stats Qos par metropole fourni par l’ARCEP</br>" +
                "<b>Exemple</b> : 2023_QoS_agregate.csv</br>" +
                "<i>service;zone;situation;mccmnc;resultat;nb_test</br>" +
                "WEB;all;all;20820;63.51851851851852;540.0</i>";
            break;
        case "site":
            info =
                "<b>Durée</b> : < 5min</br>" +
                "<b>Format</b> : csv</br>" +
                "<b>Séparateur</b> : point virgule (;) </br>" +
                "<b>Décimal</b> : point (.) </br>" +
                "<b>Encodage</b> : UTF8</br>" +
                "<b>Source</b> : fichiers CSV fournis par l’ARCEP.</br>" +
                "<b>Exemple</b> : 2024_T1_sites_Outremer.csv</br>" +
                "<i>code_op;nom_op;num_site;id_site_partage;id_station_anfr;x;y;latitude;longitude;nom_reg;nom_dep;insee_dep;nom_com;insee_com;site_2g;site_3g;site_4g;site_5g;mes_4g_trim;site_ZB;site_DCC;site_strategique;site_capa_240mbps;date_ouverturecommerciale_5g;site_5g_700_m_hz;site_5g_800_m_hz;site_5g_1800_m_hz;site_5g_2100_m_hz;site_5g_3500_m_hz</br>" +
                "20801;Orange;00081787T2;ZPB81601;0812290243;611098;6277414;43.59021;1.89946;Occitanie;Tarn;81;Algans;81006;0;1;1;0;0;1;0;0;1;;0;0;0;0;0</i>";
            break;
        case "site_avenir":
            info =
                "<b>Durée</b> : < 1min</br>" +
                "<b>Format</b> : csv</br>" +
                "<b>Séparateur</b> : point virgule (;) </br>" +
                "<b>Décimal</b> : point (.) </br>" +
                "<b>Encodage</b> : UTF8</br>" +
                "<b>Source</b> : fichiers CSV fournis par l’ARCEP.</br>" +
                "<b>Exemple</b> : data-1729581960069.csv</br>" +
                '<i>"code_op";"nom_op";"num_site";"id_station_anfr";"x";"y";"latitude";"longitude";"nom_reg";"nom_dep";"insee_dep";"nom_com";"insee_com";"site_2g";"site_3g";"site_4g";"site_5g";"date_ouverturecommerciale_5g";"site_5g_700_m_hz";"site_5g_800_m_hz";"site_5g_1800_m_hz";"site_5g_2100_m_hz";"site_5g_3500_m_hz";"id_site_partage";"mes_4g_trim";"site_zb";"site_dcc";"site_strategique";"site_capa_240mbps";"annee_donnee";"trimestre_donnee"</br>' +
                '"20815";"Free Mobile";"94069_005";"0940990271";"660576";"6857410";"48.81555";"2.46311";"Île-de-France";"Val-de-Marne";"94";"Saint-Maurice";"94069";False;True;True;True;"2020-12-15T00:00:00Z";True;False;False;False;True;NULL;False;False;False;False;True;NULL;NULL</i>';
            break;
        case "nature":
            info =
                "<b>Durée</b> : < 1min</br>" +
                "<b>Format</b> : txt</br>" +
                "<b>Source</b> : Fichier présent sur l'<a href='https://www.data.gouv.fr/fr/datasets/donnees-sur-les-installations-radioelectriques-de-plus-de-5-watts-1/' target='_blank'>" +
                "opendata</a>. </br>" +
                "<b>Info</b> : Récupérer le fichier SUP_NATURE.txt dans le ficher zip des tables de références.</br>" +
                "<b>Exemple</b> : SUP_NATURE.txt</br>" +
                "<i>NAT_ID;NAT_LB_NOM</br>" +
                "0;Sans nature</i>";
            break;
        case "sase":
            info =
                "<b>Durée</b> : ~ 10min</br>" +
                "<b>Format</b> : zip</br>" +
                "<b>Source</b> : Fichier présent sur l'<a href='https://www.data.gouv.fr/fr/datasets/donnees-sur-les-installations-radioelectriques-de-plus-de-5-watts-1/' target='_blank'>opendata</a>. </br>" +
                "<b>Info</b> : Récupérer le fichier zip des tables supports antennes emetteurs bandes.<br/>" +
                "<b>Contenu</b> : Le zip doit contenir SUP_ANTENNE.txt / SUP_BANDE.txt / SUP_EMETTEUR.txt / SUP_STATION.txt / SUP_SUPPORT.txt</br>" +
                "<b>Exemple</b> : 20241031-export-etalab-data.zip</br>";
            break;
        case "emetteur_link":
            info =
                "<b>Durée</b> : < 1min<br/>" +
                "<b>Format</b> : csv</br>" +
                "<b>Source</b> : fichiers CSV fournis par l’ARCEP.</br>" +
                "<b>Info</b> : header en minuscule<br/>" +
                "<b>Exemple</b> : emetteurs_link-2024.csv<br/>" +
                "<i>emr_lb_systeme;a_conserver;affichage;technologie<br/>" +
                "PMR;0;;<br/>" +
                "LTE 700;1;LTE 700;4G;</i>";
            break;
        case "qos":
            let url_doc_qos = $(".info_button_qos").data("url");
            info =
                "<b>Durée</b> : ~ 10min par fichier<br/>" +
                "<b>Format</b> : csv</br>" +
                "<b>Séparateur</b> : point virgule (;) </br>" +
                "<b>Décimal</b> : point (.) </br>" +
                "<b>Source</b> : fichiers CSV de qualité de service fournis par l’ARCEP.</br>" +
                "<b>Info</b> : <a href='" +
                url_doc_qos +
                "' target='_blank'>documentation</a><br/>" +
                "<b>Exemple</b> : 2023_QoS_Metropole_voix_transports.csv<br/>";
            break;
        case "zac_poi":
            info =
                "<b>Durée</b> : < 1min <br/>" +
                "<b>Format</b> : csv</br>" +
                "<b>Décimal</b> : point (.) </br>" +
                "<b>Source</b> : fichier csv des points d'intérêts pour les zones à couvrir fourni par l’ARCEP.</br>" +
                "<b>Exemple</b> : 2024_T2_dcc_Metropole_POI.csv<br/>" +
                '<i>"id_point";"num_arrete";"date_publication_arrete";"id_dossier";"nom_dossier";"nb_sites_dossier";"code_insee";"nom_commune";"departement";"insee_dep";"region";"x_lambert_93";"y_lambert_93";"20801";"20810";"20815";"20820";"origine_zone";"origine_coordonnees";"num_zone_arrete";"nom_point_arrete";"identifiant_site";"lien_arrete"</br>' +
                '"1";"2018-1";"2018-07-08";"1";"AAST";"1";"64001";"AAST";"PYRÉNÉES-ATLANTIQUES";"64";"NOUVELLE-AQUITAINE";"449114.4";"6248253.5";"1";"1";"1";"1";"ZBCB";"Arcep chef-lieu";"1";"AAST";NA;"https://www.legifrance.gouv.fr/loda/id/JORFTEXT000037161874/"</i>';
            break;
        case "zac_site":
            info =
                "<b>Durée</b> : < 1min <br/>" +
                "<b>Format</b> : csv</br>" +
                "<b>Décimal</b> : point (.) </br>" +
                "<b>Source</b> : fichier csv des points d'intérêts pour les zones à couvrir fourni par l’ARCEP.</br>" +
                "<b>Exemple</b> : 2024_T2_dcc_Metropole_sites.csv<br/>" +
                "<i>num_arrete;date_publication_arrete;numero_site;nom_site_operateurs;site_physique;numero_site_physique;nom_site_arrete;id_dossier;nom_de_la_zone;region;departement;insee_dep;x_lambert_93;y_lambert_93;20801;20810;20815;20820;op_leader;sites_demandes;sites_mes;sites_6_mois;sites_6_24_mois;sites_attente_deploiement;origine_zone;num_zone_arrete</br>" +
                "2018-1;2018-07-08;1;ZPG64601;1;1;NA;1;AAST;NOUVELLE-AQUITAINE;PYRÉNÉES-ATLANTIQUES;64;448967;6247417;1;1;1;1;20815;1;1;0;0;0;ZBCB;1</i>";
            break;
        case "zac_axe_ferre":
            info =
                "<b>Durée</b> : < 1min <br/>" +
                "<b>Format</b> : gpkg</br>" +
                "<b>Source</b> : fichier GPKG des réseaux ferrés fourni par l’ARCEP.</br>" +
                "<b>Exemple</b> : rfr.gpkg<br/>";
            break;
        case "zac_axe_routier_prioritaire":
            info =
                "<b>Durée</b> : < 1min <br/>" +
                "<b>Format</b> : gpkg</br>" +
                "<b>Source</b> : fichier GPKG des axes routiers prioritaires fourni par l’ARCEP.</br>" +
                "<b>Exemple</b> : arp.gpkg<br/>";
            break;
        case "zac_axe_routier_prioritaire_5g":
            info =
                "<b>Durée</b> : < 1min <br/>" +
                "<b>Format</b> : gpkg</br>" +
                "<b>Source</b> : fichier GPKG des axes routiers prioritaires 5G fourni par l’ARCEP.</br>" +
                "<b>Exemple</b> : arp_5G.gpkg<br/>";
            break;
        case "consolidation_site":
            info =
                "<b>Durée</b> : < 5min<br/>" +
                "<b>Etape 1</b> : Calculer la géométrie des sites <br/>" +
                "<b>Etape 2</b> : Regrouper le champ sup_id dans la table des sites<br/>" +
                "<b>Etape 3</b> : Supprimer les doublons sur les anfr_sup_support<br/>" +
                "<b>Etape 4</b> : Supprimer les supports qui n'ont pas de site associé<br/>" +
                "<b>Etape 5</b> : Mettre à jour les statistiques des sites sur les communes, départements et régions<br/>";
            break;
        case "consolidation_couverture":
            info =
                "<b>Durée</b> : ~ 10min<br/>" +
                "<b>Etape 1</b> : Mise à jour du champ operateur <br/>" +
                "<b>Etape 2</b> : Génération du cache des tuiles vectorielles";
            break;
        case "consolidation_qos":
            info =
                "<b>Durée</b> : ~ 10min<br/>" +
                "<b>Etape 1</b> : Création des géométries <br/>" +
                "<b>Etape 2</b> : Génération de la couche hexagonale <br/>" +
                "<b>Etape 3</b> : Mise à jour du champ operateur<br/>" +
                "<b>Etape 4</b> : Consolidation de la table qos_categorie_transport";
            break;
        case "delete_all":
            info =
                "Supprimer toutes les données dans les tables station, bande, antenne, support et émetteur";
            break;
        case "maintenance_site":
            info =
                "<b>Durée</b> : < 1min<br/>" +
                "<b>Action</b> : Mise à jour manuelle des sites en maintenance<br/>" +
                "<b>Source</b> : https://object.files.data.gouv.fr/arcep/sites-indisponibles/all/yyyy-mm-dd/rawyyyy-mm-dd.geojson<br/>" +
                "<b>Info</b> : Traitement automatique via cron configuré lors du déploiement Ansible<br/>" +
                "<b>Résultat</b> : Envoie de mail récapitulatif";
            break;
        case "signalements":
            let folder = $(".info_button_signalements").data("folder");
            info =
                "<b>Durée</b> : < 1min<br/>" +
                "<b>Action</b> : Mise à jour manuelle des signalements<br/>" +
                "<b>Source</b> : Intègration du fichier csv présent dans le dossier " +
                folder +
                "<br/>" +
                "<b>Info</b> : Traitement automatique via cron configuré lors du déploiement Ansible<br/>" +
                "<b>Résultat</b> : Envoie de mail récapitulatif<br/>" +
                "<b>Exemple</b> : signalements_MRM_20241007-1217_3.csv<br/>" +
                '<i>"id","date","insee_com","operateur","latitude","longitude"<br/>' +
                '0,"2024-10-01","34169","20815",43.66928472760592,3.8631989106213505</i>';
            break;
        case "copy_schema":
            info =
                "<b>Durée</b> : < 1min<br/>" +
                "<b>Action</b> : Mettre les données de l'application privée sur l'application publique<br/>" +
                "<b>Prérequis</b> : Lancer la commande Ansible de préparation de la base de données (DSI)<br/>" +
                "<b>Etape 1 </b> : Supprime le schéma public_backup<br/>" +
                "<b>Etape 2 </b> : Renomme le schéma public en public_backup<br/>" +
                "<b>Etape 3 </b> : Renomme le schéma private_backup en public<br/>" +
                "<b>Retour arrière</b> : Supprimer le schéma public et renommer le schéma public_backup en public<br/>";
            break;
    }

    return info;
};

const initInfoButtons = () => {
    initInfoButton("couverture");
    initInfoButton("stat_nbope");
    initInfoButton("stat_commune");
    initInfoButton("stat_departement");
    initInfoButton("stat_region");
    initInfoButton("stat_territoire");
    initInfoButton("site");
    initInfoButton("site_avenir");
    initInfoButton("nature");
    initInfoButton("sase");
    initInfoButton("emetteur_link");
    initInfoButton("qos");
    initInfoButton("stats_qos_departements");
    initInfoButton("qos_density");
    initInfoButton("insee_density");
    initInfoButton("qos_stat");
    initInfoButton("stats_qos_regions");
    initInfoButton("stats_qos_metropole");
    initInfoButton("zac_poi");
    initInfoButton("zac_site");
    initInfoButton("zac_axe_ferre");
    initInfoButton("zac_axe_routier_prioritaire");
    initInfoButton("zac_axe_routier_prioritaire_5g");
    initInfoButton("consolidation_site");
    initInfoButton("consolidation_couverture");
    initInfoButton("consolidation_qos");
    initInfoButton("delete_all");
    initInfoButton("signalements");
    initInfoButton("maintenance_site");
    initInfoButton("copy_schema");
};

$(function () {
    initInfoButtons();
});
