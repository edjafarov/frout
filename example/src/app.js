
import {Router} from "./router"
import HistoryApiAdapterFactory from  "../../adapters/HistoryApiAdapter"

var HistoryApiAdapter = HistoryApiAdapterFactory(mount, document.getElementById('content'));

function mount(data){
  document.getElementById('content').innerHTML = data;
}


var FrontendAdapter = HistoryApiAdapter(Router);

module.exports = function(state){
  mount(FrontendAdapter.renderer(Router.prepareRenderData(state)));
}
