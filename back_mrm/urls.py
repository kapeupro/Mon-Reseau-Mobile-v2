from django.urls import include, path
from rest_framework.routers import SimpleRouter

from back_mrm import views
from back_mrm.services.service_clone_schema import ServiceCloneSchema
from back_mrm.services.service_consolidation import ServiceConsolidation
from back_mrm.services.service_delete_all_table_station import ServiceDeleteAllTableStation
from back_mrm.services.service_delete_table import ServiceDeleteTable
from back_mrm.services.service_get_by_name import ServiceGetByName
from back_mrm.services.service_get_cluster_qos import ServiceGetClusterQosInfos
from back_mrm.services.service_get_crowd import ServiceGetCrowd
from back_mrm.services.service_get_data_geolocalisation import ServiceGetDataGeolocalisation
from back_mrm.services.service_get_density import ServiceGetDensity
from back_mrm.services.service_get_extent import ServiceGetExtent
from back_mrm.services.service_get_general_infos import ServiceGetGeneralInfos
from back_mrm.services.service_get_link_publication import ServiceGetLinkPublication
from back_mrm.services.service_get_list_operateur import ServiceGetListOperator
from back_mrm.services.service_get_nb_site import ServiceGetNbSite
from back_mrm.services.service_get_op_color_theme import ServiceGetOpColorTheme
from back_mrm.services.service_get_site import ServiceGetSite
from back_mrm.services.service_get_support import ServiceGetSupport
from back_mrm.services.service_get_territory import ServiceGetTerritory
from back_mrm.services.service_get_train import ServiceGetTrain
from back_mrm.services.service_get_zac import ServiceZac
from back_mrm.services.service_import_signalement import ServiceImportSignalement
from back_mrm.services.service_search_by_id import ServiceSearchById
from back_mrm.services.service_search_optimal import ServiceSearchOptimal
from back_mrm.services.service_update_site import ServiceUpdateSite
from back_mrm.stat.antenne_operateur import StatAntenneOperateur
from back_mrm.stat.couv_operateur import StatCouvOperateur
from back_mrm.stat.couverture import StatCouverture
from back_mrm.stat.nbope import StatNbope
from back_mrm.stat.qos import StatQos
from back_mrm.stat.signalement import StatSignalement
from back_mrm.stat.territoire_train import StatTerritoireTrain
from back_mrm.stat.test import StatTest
from back_mrm.stat.zac_operateur import StatZacOperateur
from back_mrm.stat.zone import StatZone
from back_mrm.views.csrf import csrf
from back_mrm.views.dataqostype import DataQosType
from back_mrm.views.delete_file import RemoveFileView
from back_mrm.views.delete_file_db import RemoveFileInDBView
from back_mrm.views.delete_source_desc import DeleteSourceDesc
from back_mrm.views.delete_table import RemoveTableView
from back_mrm.views.get_files_sabes import GetFilesSabes
from back_mrm.views.getCrowdFromSource import GetCrowdFromSource
from back_mrm.views.import_couvertures import ImportCourverturesView
from back_mrm.views.import_file_db import ImportFileDbView
from back_mrm.views.import_file_qos import ImportFileQos
from back_mrm.views.import_qos import ImportQosView
from back_mrm.views.import_signalements import ImportSignalementsView
from back_mrm.views.import_sites import ImportSitesView
from back_mrm.views.import_zac import ImportZacView
from back_mrm.views.is_file_generated import IsFileGenerated
from back_mrm.views.login import LoginView
from back_mrm.views.logout import LogoutView
from back_mrm.views.parameterslink import ParametersLinkListView, ParametersLinkView
from back_mrm.views.testmail import TestMailView
from back_mrm.views.update_after_import import UpdateImportiew
from back_mrm.views.upload_file import UploadFileView

router = SimpleRouter()
# router = routers.DefaultRouter()

router.register("operateurs", views.OperateurViewSet, basename="operateur_list")

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/search/", ServiceGetByName.as_view()),
    path("api/search_optimal/", ServiceSearchOptimal.as_view()),
    path("api/search_one/", ServiceSearchById.as_view()),
    path("api/support/", ServiceGetSupport.as_view()),
    path("api/operateur/", ServiceGetListOperator.as_view()),
    path("api/extent/", ServiceGetExtent.as_view()),
    path("api/site/", ServiceGetSite.as_view()),
    path("api/clusterQos/", ServiceGetClusterQosInfos.as_view()),
    path("api/nb_site/", ServiceGetNbSite.as_view()),
    path("api/crowd/", ServiceGetCrowd.as_view()),
    # path('api/importengine/', ImportEngineView.as_view(), name='engine'),
    path("api/stat_couverture/", StatCouverture.as_view()),
    path("api/stat_test/", StatTest.as_view()),
    path("api/stat_zone/", StatZone.as_view()),
    path("api/stat_signalement/", StatSignalement.as_view()),
    path("api/stat_nbope/", StatNbope.as_view()),
    path("api/stat_couv_operateur/", StatCouvOperateur.as_view()),
    path("api/update_import/<str:data_type>/", UpdateImportiew.as_view()),
    path("api/territory/", ServiceGetTerritory.as_view()),
    path("api/stat_qos/", StatQos.as_view()),
    path("api/density/", ServiceGetDensity.as_view()),
    path("api/generalinfos/", ServiceGetGeneralInfos.as_view()),
    path("api/stat_antenne_operateur/", StatAntenneOperateur.as_view()),
    path("api/stat_zac_operateur/", StatZacOperateur.as_view()),
    path("api/zac_infos/", ServiceZac.as_view()),
    path("api/stat_territoire_train/", StatTerritoireTrain.as_view()),
    path("api/link_publication/", ServiceGetLinkPublication.as_view()),
    path("api/train/", ServiceGetTrain.as_view()),
    path("api/operator_color_theme/", ServiceGetOpColorTheme.as_view()),
    path("api/data_geolocalisation/", ServiceGetDataGeolocalisation.as_view()),
    path("api/dataqos_type_byop/", DataQosType.as_view(), name="gettypedateqos"),
    # parameters link
    path("api/parameterslink/<int:pk>", ParametersLinkView.as_view(), name="parameters-du"),
    path("api/parameterslink/", ParametersLinkView.as_view(), name="parameters-cr"),
    path("api/parameterslink/all/", ParametersLinkListView.as_view(), name="all-parameters-list"),
    # backend URL
    path(
        "api/backend/get_crowd_from_source/<int:id_data_source>/",
        GetCrowdFromSource.as_view(),
        name="get_crowd_from_source",
    ),
    path("api/backend/updatesite/", ServiceUpdateSite.as_view(), name="update_site"),
    path("api/backend/import_db/<str:table>/", ImportFileDbView.as_view(), name="import_db"),
    path("api/backend/login", LoginView.as_view(), name="login"),
    path("api/backend/logout", LogoutView.as_view(), name="logout"),
    path("api/backend/import/", ImportCourverturesView.as_view(), name="home"),
    path("api/backend/import_couvertures/", ImportCourverturesView.as_view(), name="couvertures"),
    path("api/backend/import_sites/", ImportSitesView.as_view(), name="sites"),
    path("api/backend/import_qos/", ImportQosView.as_view(), name="qos"),
    path("api/backend/import_zac/", ImportZacView.as_view(), name="zac"),
    path("api/backend/upload/<str:data_type>/", UploadFileView.as_view(), name="upload"),
    path("api/backend/delete_file/<str:data_type>/<str:file_name>/", RemoveFileView.as_view(), name="delete_file"),
    path("api/backend/delete_table/<str:table>/", RemoveTableView.as_view(), name="delete_table"),
    path(
        "api/backend/delete_file_db/<str:data_type>/<str:file_name>/",
        RemoveFileInDBView.as_view(),
        name="delete_file_db",
    ),
    path("api/backend/import_file_qos/", ImportFileQos.as_view(), name="import_file_qos"),
    path("api/backend/delete_data_source_desc/", DeleteSourceDesc.as_view(), name="delete_data_source_desc"),
    path("api/backend/copyschema/", ServiceCloneSchema.as_view(), name="copy_schema"),
    path("api/backend/consolidation/", ServiceConsolidation.as_view(), name="consolidation"),
    path("api/backend/deleteall/", ServiceDeleteTable.as_view(), name="deleteall"),
    path("api/backend/get_files_sabes/", GetFilesSabes.as_view(), name="get_files_sabes"),
    path("api/backend/isfilegenerated/", IsFileGenerated.as_view(), name="isfilegenerated"),
    path("api/backend/delete_all_table_station/", ServiceDeleteAllTableStation.as_view(), name="deleteallstation"),
    path("api/backend/import_signalements/", ImportSignalementsView.as_view(), name="signalements"),
    path("api/backend/testmail/", TestMailView.as_view()),
    path("api/backend/importsignalement/", ServiceImportSignalement.as_view(), name="import_signalement"),
    path("api/csrf/", csrf, name="csrf"),
]
