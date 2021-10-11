const average = arr => arr.reduce((a,b) => a + b, 0) / arr.length;

var p = document.getElementById("trueProportion").value;
var m = 20;
var confidence_level = document.getElementById("confidenceLevel").value;
var sample_size = document.getElementById("sampleSize").value;

var draw_1_btn = document.getElementById("draw1");
var draw_20_btn = document.getElementById("draw20");
var reset_btn = document.getElementById("reset-graph");
var accurate_intervals = 0;
var accurate_intervals_text = document.getElementById("contain-parameter");


function createInitialTrace(){
    return {
        x: [p], y: [m+1],
        type: "scatter", hovertemplate: "Population proportion: " + p,
        marker: { size: 0.5}
    };
}

function createPopulationProportionShape(){
    return{
        type: "line",
        x0: p, x1: p, y0: -0.5, y1: Math.max(21,m+1),
        line: {dash: "dot", color: "blue"}
    }
};

function createLayout(lines){
    return {
        showlegend: false,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: {t:10, b:2},
        xaxis: { range: [0, 1], gridcolor: "lightgrey", showline: true, mirror: true},
        yaxis: {
            range: [Math.max(-1.5, m-50), m+1], autorange: "reversed", gridcolor: "lightgrey",
            zeroline: false, mirror: true, showline: true
        },
        shapes: lines,
        annotations: [{x: p, y: -1, text: "Population proportion: " + p, showarrow: false}]
    }
}

// Generate initial plot
function createInitialPlot() {
    var data = [createInitialTrace()]; // Pseudo trace needed to keep axis reversed
    var layout = createLayout([createPopulationProportionShape()]);
    Plotly.newPlot('hypothesis-chart', data, layout);
}

// Get population
async function getPopulation() {
    let response = await fetch('/proportion/generate_population/' + p);
    let text = await response.text();
    return [].concat(JSON.parse(text));
}

population_promise = getPopulation();

// drawing samples
var traces = [];
var lines = [];
var m = 0;

function drawSample(pop, size) {
    var sample = [];
    for(let i=0; i<size; i++){
        sample.push(pop[Math.floor(Math.random() * 100000)]);
    }
    return sample;
}

function createTraceFromProportion(p_hat, color) {
    m++;
    return {
        x: [p_hat], y: [m],
        type: "scatter", hovertemplate: "Sample proportion: " + p_hat,
        marker: {color: color}
    };
}

function createLineFromProportion(left, right, sample_id, color) {
    return {
        type: "line", xref: "x", yref: "y",
        x0: left, x1: right, y0: sample_id, y1: sample_id,
        line: {color: color}
    };
}

async function generateConfidenceInterval(p_hat, sample_size, confidence_level) {
    let response = await fetch("/proportion/generate_confidence_interval/"+p_hat+"/"+sample_size+"/"+confidence_level);
    let text = await response.text();
    text = JSON.parse(text);
    return text;
}

async function generateTraceAndLineAsync(sample_size) {
    let pop = await population_promise;
    let sample = drawSample(pop, sample_size);
    let sample_proportion = average(sample);
    let ci = await generateConfidenceInterval(sample_proportion, sample_size, confidence_level);
    let color = "red";
    if((ci["left"]<=p) && (ci["right"]>=p)) {
        color = "#04AA6D";
        accurate_intervals++;
    }
    traces.push(new Promise( resolve => resolve(createTraceFromProportion(sample_proportion, color))));
    lines.push(new Promise( resolve => resolve(createLineFromProportion(ci["left"], ci["right"], m, color))));
}

async function updatePlot(data_promises, line_promises) {
    await Promise.all(data_promises).then(async function(d) {
        await Promise.all(line_promises).then(l => {
            let layout = createLayout([createPopulationProportionShape()].concat(l));
            Plotly.newPlot('hypothesis-chart', d, layout);
        })
    })
}

async function addEstimationToGraph(){
    let pop = await population_promise;
    await generateTraceAndLineAsync(sample_size);
    updatePlot(traces, lines);
    accurate_intervals_text.innerText = "Accurate: " + accurate_intervals + "/" + m + ", " + Math.round( 100.0*accurate_intervals/m  * 100 + Number.EPSILON ) / 100 + "%"
}

function resetGraph(){
    createInitialPlot();
    traces = [];
    lines = [];
    m = 0;
    accurate_intervals = 0;
    accurate_intervals_text.innerText = "";
}

createInitialPlot();

draw_1_btn.addEventListener("click", addEstimationToGraph);
draw_20_btn.addEventListener("click", async function(){
    for(let i=0; i<20; i++){
        await addEstimationToGraph();
    }
});
reset_btn.addEventListener("click", resetGraph);


async function changePopulationProportion() {
    p = document.getElementById("trueProportion").value;
    population_promise = getPopulation();
    if(traces.length==0){
        createInitialPlot();
    } else {
        let traces_length = traces.length;
        resetGraph();
        for(let i=0; i<traces_length; i++){
            await addEstimationToGraph();
        }
    }
}

async function changeConfidenceLevel() {
    confidence_level = confidence_level = document.getElementById("confidenceLevel").value;
    if(traces.length==0){
        createInitialPlot();
    } else {
        let traces_length = traces.length;
        resetGraph();
        for(let i=0; i<traces_length; i++){
            await addEstimationToGraph();
        }
    }
}

async function changeSampleSize() {
    sample_size = document.getElementById("sampleSize").value;
    if(traces.length==0){
        createInitialPlot();
    } else {
        let traces_length = traces.length;
        resetGraph();
        for(let i=0; i<traces_length; i++){
            await addEstimationToGraph();
        }
    }
}