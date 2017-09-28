const express = require('express');
const app = express();
app.use(express.static('www'));
var PORT = 80;
if( process.env.PORT ){
	PORT = process.env.PORT;
}
app.listen(PORT, function () {
    console.log('Example app listening on port ' + PORT );
});
