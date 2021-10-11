function addBubbleToSlider(slider_id){
    const
      range = document.getElementById(slider_id),
      rangeV = document.getElementById(slider_id + "V"),
      setValue = ()=>{
        const
          newValue = Number( (range.value - range.min) * 100 / (range.max - range.min) ),
          newPosition = 10 - (newValue * 0.2);
        rangeV.innerHTML = `<span>${range.value}</span>`;
      };
    document.addEventListener("DOMContentLoaded", setValue);
    range.addEventListener('input', setValue);
}

addBubbleToSlider("trueProportion")
addBubbleToSlider("confidenceLevel")
addBubbleToSlider("sampleSize")

/*************** Population proportion test graph ***************************/


