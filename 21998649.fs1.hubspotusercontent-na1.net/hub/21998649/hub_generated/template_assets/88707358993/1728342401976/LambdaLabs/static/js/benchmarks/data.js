function getUrlVars() {
    var vars = {};
    window.location.href.replace(
        /[?&]+([^=&]+)=([^&]*)/gi,
        function (m, key, value) {
            vars[key] = value;
        }
    );
    return vars;
}
var lambda_mode,
    data = (function () {
        console.log(5)
        var output = fetch(
            "http://192.168.0.2:8080/21998649.fs1.hubspotusercontent-na1.net/hubfs/21998649/raw_assets/public/LambdaLabs/static/js/benchmarks/data.json"
        )
            .then((response) => response.json())
            .then((data) => data)
            .catch((err) => (console.log("error reading data - ", err), {}));
        return output;
    })(),
    lambda_mode_raw = getUrlVars().lambda_mode;
0 ===
    (lambda_mode =
        void 0 !== lambda_mode_raw ? parseInt(lambda_mode_raw) : 0) &&
    (data = $.grep(data, function (n, i) {
        return 0 === n.Lambda;
    }));
//# sourceURL=21998649.fs1.hubspotusercontent-na1.net/hub/21998649/hub_generated/template_assets/88707358993/1728342401976/LambdaLabs/static/js/benchmarks/data.js
