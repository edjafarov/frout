var express = require('express');
var app = express();
import {Router} from "./src/router"
import ExpressAppAdapter from "../adapters/ExpressAdapter.js"

function layout(html, renderData){
  var stateString = JSON.stringify(renderData);
 return `<html>
<head>
</head>
<body>
	<div id="content">${html}</div>
	<script type="text/javascript" src="/bundle.js"></script>
	<script type="text/javascript">
		require('app')(${stateString});
	</script>
</body>
</html>`;
}

app.use(express.static("./"))
Router.use(ExpressAppAdapter(app, layout));



app.listen(3000);
