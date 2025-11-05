import {categoryView, plantDetails, plantView} from './view.js';

const pageContainer = document.getElementById("app");

const catView = new categoryView();
const plantD = new plantDetails();
const plantv = new plantView();

const viewMap = {    
    "catView": catView,
    "plantD": plantD,
    "plantV": plantv
}

const catViewURL = "https://sukkergris.no/plantcategories/";



history.replaceState("catView", ""); 
loadData();
navigateTo("catView", false);

//-----------------------------------------------

async function loadData() {
     try {
        const response = await fetch(catViewURL);
        const data = await response.json();

        catView.refresh(data);
        console.log(data);

    } catch (error) {
        console.log(error);
    }
}

//-----------------------------------------------

function navigateTo(view, push){
    if (push) {
        history.pushState(view, ""); 
    }
    pageContainer.innerHTML = ""; 
    pageContainer.appendChild(viewMap[view]); 
}

//----------------------------------------------- click funksjon i Kategori som tar deg videre til PlantView

pageContainer.addEventListener("plantSelected", async function(evt){
   
    const category = evt.detail.kategori;
    try {
        const response = await fetch(`https://sukkergris.no/plants/?category=${category}`);
        const data = await response.json();
        plantv.refresh(data); 
        navigateTo("plantV", true);
    } catch (error) {
        console.log(error);
    }
});

//----------------------------------------------- click funksjon i PlantView som tar deg tilbake til Kategori   

pageContainer.addEventListener("plantBack", function(evt){
    navigateTo("catView", true);
});

//----------------------------------------------- click funksjon i PlantView som tar deg videre til PlantDetails

pageContainer.addEventListener("plantDetails", async function(evt){
    const plantId = evt.detail.id;
    try {
        const response = await fetch(`https://sukkergris.no/plant/?id=${plantId}`);
        const data = await response.json();
        plantD.refresh(data); 
        navigateTo("plantD", true);
    } catch (error) {
        console.log(error);
    }
});

pageContainer.addEventListener("catBack", function(evt){
    
});

pageContainer.addEventListener("detailsBack", function(evt){
    navigateTo("plantV", true);
});