var def_pytorch_filters = {
        Visualization: ["chart", "table"],
        Metric: [
            "throughput",
            "bs",
            "throughput/watt",
            "bs/watt",
            "throughput/$",
            "bs/$"
        ],
        Precision: ["fp32", "fp16"],
        NUM_GPU: [1, 2, 4, 8, -1],
        Models: [
            "All Models",
            "ssd",
            "resnet50",
            "gnmt",
            "bert_base_squad",
            "bert_large_squad",
            "tacotron2",
            "waveglow"
        ]
    },
    def_tf_filters = {
        Visualization: ["chart", "table"],
        Metric: [
            "throughput",
            "bs",
            "throughput/watt",
            "bs/watt",
            "throughput/$",
            "bs/$"
        ],
        Precision: ["fp32", "fp16"],
        NUM_GPU: [1, 2, 3, 4, 8, -1],
        Models: [
            "All Models",
            "resnet50",
            "resnet152",
            "inception3",
            "inception4",
            "vgg16",
            "alexnet"
        ]
    },
    def_yolov5_filters = {
        Visualization: ["chart", "table"],
        Metric: ["latency"],
        Precision: ["fp32"],
        Methods: ["PyTorch", "TorchScript", "ONNX", "TF", "TFGraphDef"],
        Models: [
            "All Models",
            "YOLOv5l",
            "YOLOv5l6",
            "YOLOv5m",
            "YOLOv5m6",
            "YOLOv5n",
            "YOLOv5n6",
            "YOLOv5s",
            "YOLOv5s6",
            "YOLOv5x",
            "YOLOv5x6TTA"
        ]
    };
function get_data(framework, mode, metric, precision) {
    console.log(6)
    return fetch(
        `http://192.168.0.2:8080/21998649.fs1.hubspotusercontent-na1.net/hubfs/21998649/raw_assets/public/LambdaLabs/static/js/benchmarks/${framework}-${mode}-${metric}-${precision}.json`
    )
        .then((response) => response.json())
        .then((data) => data)
        .catch((err) => (console.log("error getting data - ", err), {}));
}
function create_dropdowns(framework, name, items) {
    for (var content = "", i = 0; i < items.length; i++) {
        var v = -1 == items[i] ? "All GPUs" : items[i];
        "bs" == items[i] && (v = "batch size"),
            "bs/watt" == items[i] && (v = "batch size/watt"),
            "bs/$" == items[i] && (v = "batch size/$"),
            "number" == typeof items[i] && items[i] > 0 && (v += "x"),
            "fp32" == items[i] && (v = "fp32"),
            (content +=
                0 == i
                    ? '<option value="' +
                      items[i] +
                      '" selected="selected">' +
                      v +
                      "</option>"
                    : '<option value="' + items[i] + '">' + v + "</option>");
    }
    document.getElementById(framework + "_" + name).innerHTML += content;
}
function get_dropdowns(framework) {
    var selected = {},
        filters = null;
    for (var key in (framework.includes("pytorch")
        ? (filters = def_pytorch_filters)
        : "tf" == framework
        ? (filters = def_tf_filters)
        : "yolov5" == framework && (filters = def_yolov5_filters),
    filters))
        if (filters.hasOwnProperty(key)) {
            var v = document.getElementById(framework + "_" + key).value;
            "number" == typeof filters[key][0] && (v = Number(v)),
                (selected[key] = v);
        }
    return selected;
}
//# sourceURL=21998649.fs1.hubspotusercontent-na1.net/hub/21998649/hub_generated/template_assets/88700485253/1728342386840/LambdaLabs/static/js/benchmarks/common.js
