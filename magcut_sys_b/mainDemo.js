"use strict";

var imageSet = 0, imagesRef = 0, allHomographies = [];

if(localStorage.getItem('selectSceneNum')){
    imageSet = localStorage.getItem('selectSceneNum');
}else{
    imageSet = 1;
}

if(imageSet == 1111){
    console.log("Test set");

    var imagesRef = ["../imgs/RGB_1a.png", "../imgs/RGB_2b.png"];
    // var imagesRef = ["../imgs/test/jag1_s.jpg", "../imgs/test/jag2_s.jpg"];
    // var imagesRef = ["../imgs/poissonTest/BASEcanvas.png", "../imgs/poissonTest/SRCcanvas.png"];
    // var imagesRef = ["../imgs/relative/RGB_1a.png", "../imgs/relative/RGB_2b.png"];
    var h1 = [[1, 0, 0, 0, 1, 0, 0, 0, 1]];
    allHomographies = [h1, h1];
}


if(imageSet == 10){
    console.log("image skate");
    var homographiesSkateH1 = [[1.01232016086578371, -0.03562629222869873, -0.2494911551475525, 0.0240448247641325, 1.003004550933838, -7.859261989593506, 0.000019387967768125236, -2.606635973734228e-7, 0.9999918937683105],
                            [1.02300953865051271, -0.051322754472494125, -7.183257102966309, 0.03715682402253151, 1.0254374742507935, -15.981046676635742, 0.000023618376872036606, 0.00004184681529295631, 0.9991756677627563],
                            [1.03538787364959721, -0.07033353298902512, -6.421023368835449, 0.05351170897483826, 1.0444682836532593, -24.36629867553711, 0.00002706960731302388, 0.0000887837668415159, 0.9977540373802185]];

    var homographiesSkateH2 = [ [0.9935616254806519, 0.022961584851145744, 2.0279738903045654, -0.016881121322512627, 0.9829508066177368, 9.066900253295898, 0.0000020164300167380134, -0.000027423269784776494, 0.9997498393058777],
                                [1.008139967918396, -0.02915077470242977, -3.982980728149414, 0.013716734945774078, 1.003922939300537, -4.8862786293029785, 0.0000097715901574702, 0.000009598177712177858, 0.9999138712882996],
                                [1.025726318359375, -0.040721114724874496, -5.513948440551758, 0.0319267176091671, 1.0321699380874634, -14.991840362548828, 0.00001794604759197682, 0.00006677394412690774, 0.9989356994628906]];

    var homographiesSkateH3 = [[0.9844263195991516, 0.07760336250066757, 0.9172807931900024, -0.038402311503887177, 1.0057977437973022, 10.538883209228516, -0.00003209868009435013, 0.000015300389350159094, 1.0001569986343384],
                               [0.9837057590484619, 0.02084650658071041, 5.679980754852295, -0.013236194849014282, 0.9741256833076477, 8.169403076171875, -0.00000852894845593255, -0.00004212540443404578, 0.9995958209037781],
                               [1.0119044780731201, -0.02471163496375084, 1.0030813217163086, 0.019214699044823647, 1.0028046369552612, -6.1342573165893555, 0.00001572541441419162, 0.000007192982138803927, 0.9999691247940063]];                          


    var homographiesSkateH4 = [ [1.0034410953521729, 0.10580038279294968, -2.633333683013916, -0.04826546460390091, 1.0392612218856812, 9.614594459533691, -0.00001411048651789315, 0.000048721445637056604, 1.0004931688308716],
                                [0.9702436327934265, 0.038123153150081635, 5.645430088043213, -0.030359214171767235, 0.9601770639419556, 15.047872543334961, -0.000018308333892491646, -0.00007151411409722641, 0.9987723231315613],
                                [0.9932973384857178, 0.021523039788007736, -0.7826990485191345, -0.016987880691885948, 0.9987582564353943, 5.709329128265381, -0.000008478637028019875, -0.0000054096171879791655, 0.9999768733978271]];

    imagesRef = ["../imgs/skate/3867131192_474809a118_z.jpg", "../imgs/skate/3866347673_c48e0b9bb4_z.jpg", "../imgs/skate/3866348017_518a69bc0d_z.jpg", "../imgs/skate/3867132330_a95335e9bc_z.jpg"];
    allHomographies = [homographiesSkateH1,homographiesSkateH1,homographiesSkateH1,homographiesSkateH4];  

}

if(imageSet == 9){
    console.log("image sledge");
    var homographiesSledgeH1 = [[0.8540396690368652, 0.050457216799259186, 82.4438705444336, -0.048826929181814194, 0.9423742294311523, -15.728147506713867, -0.00022851054382044822, 0.00008584446186432615, 0.9767833352088928]];
    var homographiesSledgeH2 = [[1.1210564374923706, -0.04179324954748154, -95.68238830566406, 0.0580456405878067, 1.056733250617981, 11.733060836791992, 0.00022505367815028876, 0.00009044092439580709, 0.9823490977287292]];

    imagesRef = ["../imgs/sledge/4327623098_3cbf312e44_z.jpg", "../imgs/sledge/4327623464_ccc39d973e_z.jpg"];
    allHomographies = [homographiesSledgeH1,homographiesSledgeH2];  
}

if(imageSet == 8){
    console.log("image Bike 2");
    var homographiesBike2H1 = [[1.0426149368286133, 0.005307071376591921, -189.84532165527344, 0.008166481740772724, 1.0165867805480957, 8.435789108276367, 0.00008387637353735045, -0.000003546401330822846, 0.9846885204315186]];
    var homographiesBike2H2 = [[0.9327494502067566, 0.006602529436349869, 177.8943328857422, -0.008301511406898499, 0.9705546498298645, -9.088162422180176, -0.0000797122047515586, 0.000016857224181876518, 0.9846625328063965]];
    allHomographies = [homographiesBike2H1,homographiesBike2H2];  
    imagesRef = ["../imgs/bike2/14581982516_3924617b5b_z.jpg", "../imgs/bike2/14603000124_37300b9db1_z.jpg"];
}

if(imageSet == 1){
    var homographiesELH1 = [[1.0389015674591064, -0.021919989958405495, -4.273282051086426, 0.09422748535871506, 0.9875717163085938, -5.8898749351501465, 0.00006793891952838749, -0.0000867368362378329, 1.0001949071884155]];
    var homographiesELH2 =[[ 0.9784799218177795, 0.014791175723075867, 0.5339639782905579, -0.09201742708683014, 1.0146938562393188, 6.114669322967529, -0.00005027901352150366, 0.00006726609717588872, 1.0003852844238281 ]];
    console.log("image Set 1");
    allHomographies = [homographiesELH1,homographiesELH2];  
    imagesRef = ["../imgs/EandL/P1180178.jpg", "../imgs/EandL/P1180179.jpg"];
}
else if(imageSet == 2){
    var homographiesSkiH1 = [[1.01169753074646, -0.016839805990457535, 22.81320571899414, 0.02119976095855236, 0.9952255487442017, -7.414227485656738, 0.000012518536095740274, 0.000008109120244625956, 1.0002163648605347],
    [0.9661481976509094, -0.029190676286816597, 113.27467346191406, 0.017496902495622635, 0.9802349805831909, -6.218682765960693, -0.000040292612538905814, -0.00001541243545943871, 0.9954161643981934],
    [0.967432975769043, -0.016158273443579674, 150.0976104736328, 0.016845792531967163, 0.9825758337974548, -24.608877182006836, -0.00004376105425762944, 0.0000280006952380063, 0.9924551844596863],
    [0.937919557094574, -0.007838856428861618, 150.89927673339844, -0.0026983320713043213, 0.9693214297294617, -29.952003479003906, -0.00007996862404979765, 0.000009929681255016476, 0.9868520498275757]];
    var homographiesSkiH2 = [[0.9813196063041687, -0.003270781831815839, -19.718448638916016, -0.025491315871477127, 0.9755317568778992, 11.485857009887695, -0.000013089696949464269, -0.00006815016240580007, 0.9994958639144897],
    [0.9375579953193665, -0.01717488095164299, 92.28602600097656, -0.006694590672850609, 0.9646527171134949, 3.4758987426757812, -0.0000736266520107165, -0.000030116832931526005, 0.9926178455352783],
    [0.9423925876617432, -0.011368698440492153, 128.0341796875, 0.0032766549848020077, 0.9703877568244934, -17.63808822631836, -0.00007681920396862552, -0.00000841243763716193, 0.989737331867218],
    [0.9498104453086853, 0.020767856389284134, 126.0226821899414, -0.01134435087442398, 0.9838808178901672, -24.66139793395996, -0.00007451975397998467, 0.000041468072595307603, 0.9890984892845154]];
    var homographiesSkiH3 = [[1.0139126777648926, 0.022940490394830704, -113.59968566894531, -0.01728522591292858, 1.0102853775024414, 8.091630935668945, 0.00002689881148398854, -0.000005228447662375402, 0.9969506859779358],
    [1.0451877117156982, 0.017562206834554672, -97.22286987304688, 0.007259022444486618, 1.0259953737258911, -4.289793968200684, 0.0000657521522953175, 0.00001741613232297823, 0.9938262701034546],
    [0.9840916991233826, 0.0011156642576679587, 40.44911193847656, -0.0002805233816616237, 0.9953309297561646, -18.887020111083984, -0.00002594508623587899, 0.000011096006346633658, 0.9987226128578186],
    [0.9838175773620605,0.01544911228120327, 39.93574523925781, -0.01599566452205181, 0.9923341870307922, -23.280550003051758, -0.00002696404953894671, 0.000002234232169939787, 0.9988448619842529]];
    var homographiesSkiH4 =[[1.0269458293914795, 0.026224985718727112, -155.84146118164062, -0.015786726027727127, 1.0152915716171265, 27.3282470703125, 0.00005677257286151871, -0.00000354270468960749, 0.9912620782852173],
    [1.034406304359436, 0.01214594952762127, -133.55679321289062, -0.00219235778786242, 1.0169494152069092, 18.38968276977539, 0.00007074053428368643, 0.0000010010813866756507, 0.990869402885437],
    [1.010952353477478, 0.0015984297497197986, -40.74266052246094, 0.00032625222229398787, 1.003129482269287, 19.029930114746094, 0.000021905025278101675, -0.0000075593557085085195, 0.99897301197052],
    [1.0019458532333374, 0.022620707750320435, -1.1114107370376587, -0.015627743676304817, 1.0039751529693604, -4.454003810882568, -8.904158903533244e-7, 0.000014966783965064678, 0.9999342560768127]];
    var homographiesSkiH5 =[[1.02799391746521, 0.006391704082489014, -155.6632537841797, 0.0007734594983048737, 1.0107998847961426, 31.66087532043457, 0.00006575458246516064, -0.00002313648656127043, 0.989302933216095],
    [1.0355504751205444, -0.004942593164741993, -133.48455810546875, 0.012805087491869926, 1.0172375440597534, 23.023300170898438, 0.0000786042510299012, -0.000003400243258511182, 0.9897943735122681],
    [1.0128307342529297, -0.017082683742046356, -40.7623405456543, 0.01680472120642662, 1.0037094354629517, 22.917695999145508, 0.000026313451598980464, -0.000009436296750209294, 0.9987296462059021],
    [1.0027586221694946, -0.02336910180747509, 0.014896824024617672, 0.017289433628320694, 0.9969953894615173, 3.8658764362335205, 0.000008945458830567077, -0.00002403052531008143, 0.9999077916145325]];

    allHomographies = [homographiesSkiH1,homographiesSkiH2,homographiesSkiH3,homographiesSkiH4,homographiesSkiH5];  
    imagesRef = ["../imgs/ski/ski1.jpg","../imgs/ski/ski2.jpg","../imgs/ski/ski3.jpg","../imgs/ski/ski4.jpg","../imgs/ski/ski5.jpg"];
}
else if(imageSet == 3){
    var homographiesHundH1 = [[0.9959573149681091, -0.004883802495896816, 2.678840160369873, 0.005868001375347376, 0.9916155338287354, 1.220236897468567, 0.000002886128186219139, -0.000019482627976685762, 0.9999841451644897 ]]
    var homographiesHundH2 = [[1.0037338733673096, 0.0017153428634628654, -2.2722158432006836, -0.004822799004614353, 1.0045233964920044, -1.1375906467437744, -0.0000012442297929737833, 0.000012024049283354543, 0.9999890923500061]]
    allHomographies = [homographiesHundH1,homographiesHundH2];  
    imagesRef = ["../imgs/hundar/DSC6201.jpg", "../imgs/hundar/DSC6202.jpg"];
}
else if(imageSet == 4){
    var homographiesCarH1 =[[1.0406215190887451, -0.0030779337976127863, -140.2157440185547, 0.017164135351777077, 1.0202465057373047, -0.7551611661911011, 0.00009318920638179407, -5.902680300096108e-7, 0.9874429702758789],
    [1.0750093460083008, -0.02087479643523693, -508.8431701660156, 0.08801420778036118, 1.0420607328414917, -16.94595718383789, 0.00040142808575183153, 0.00004092470044270158, 0.8111422657966614]];
    var homographiesCarH2 =[[0.972752034664154, -0.0057953596115112305, 134.65829467773438, -0.008775225840508938, 1.0011701583862305, -5.0560622215271, -0.00004124096449231729, 0.00002398512515355833, 0.9941999316215515],
    [1.0654523372650146, -0.025096984580159187, -361.77484130859375, 0.06723976880311966, 1.0343387126922607, -5.541501045227051, 0.00023750626132823527, -0.000031810126529308036, 0.9189171195030212]];
    var homographiesCarH3 =[[0.5839483737945557, -0.034430377185344696, 378.4354553222656, -0.059002310037612915, 0.7470527291297913, -17.07809066772461, -0.000307348178466782, -0.0000905879569472745, 0.7977254986763],
    [0.7873080372810364, 0.02911977842450142, 311.2395935058594, -0.05235334858298302, 0.8844791054725647, -15.283720016479492, -0.0002088312030537054, 0.000021151159671717323, 0.9176208972930908]];
    allHomographies = [homographiesCarH1,homographiesCarH2,homographiesCarH3];  
    imagesRef = ["../imgs/cars/_DSC1526.jpg", "../imgs/cars/_DSC1533.jpg", "../imgs/cars/_DSC1561.jpg"];
}
else if(imageSet == 5){

    // // 50-53-51
    // var homographiesBike2H1 = [[1.020303726196289, -0.010079147294163704, -42.59284591674805, -0.008457145653665066, 0.9905731081962585, -6.965245246887207, 0.00004839357643504627, -0.00012295154738239944, 0.9988846778869629],
    //                         [0.9562448859214783, -0.04059208929538727, 55.0452766418457, 0.002029840601608157, 0.9665254354476929, 11.779176712036133, -0.00005650325692840852, -0.00007099410140654072, 0.9958619475364685]]; 
    // //51-50-53
    // var homographiesBike2H2 = [[ 0.9660865664482117, -0.008302299305796623, 45.14383316040039, 0.005773747805505991, 0.9849867820739746, 9.751049995422363, -0.0000490144120703917, 0.00006797895184718072, 0.9983599185943604 ],
    //                         [0.8957809209823608, -0.025373294949531555, 98.51021575927734, 0.004517511930316687, 0.939185619354248, 21.728973388671875, -0.00012811814667657018, -0.00000596984045841964, 0.9856936931610107]];
    // //53-50-51
    // var homographiesBike2H3 = [[1.0311598777770996, 0.0011012349277734756, -54.12679672241211, -0.0024361235555261374, 1.0119781494140625, -11.21747875213623, 0.00006324340938590467, -0.000037644367694156244, 0.9971030950546265],
    //                     [1.0898643732070923, 0.06088623031973839, -113.0201416015625, -0.008569265715777874, 1.0580685138702393, -22.7808895111084, 0.00014498442760668695, 0.00005467134542413987, 0.983923614025116]];
    // imagesRef = ["../imgs/bike/IMG_0050.jpg", "../imgs/bike/IMG_0051.jpg", "../imgs/bike/IMG_0053.jpg"];



    // 53-51
    var homographiesBike2H1 = [[0.9562448859214783, -0.04059208929538727, 55.0452766418457, 0.002029840601608157, 0.9665254354476929, 11.779176712036133, -0.00005650325692840852, -0.00007099410140654072, 0.9958619475364685]]; 
    //51-53
    var homographiesBike2H2 = [[1.0311598777770996, 0.0011012349277734756, -54.12679672241211, -0.0024361235555261374, 1.0119781494140625, -11.21747875213623, 0.00006324340938590467, -0.000037644367694156244, 0.9971030950546265]];
    imagesRef = ["../imgs/bike/IMG_0050.JPG", "../imgs/bike/IMG_0053.JPG"];

    console.log("image Set 5");
    allHomographies = [homographiesBike2H1,homographiesBike2H2];  
    
}else if(imageSet == 6){
    // 28-29
    var homographiesSienceParkH1 = [[1.3479026556015015, 0.008745760656893253, -210.18344116210938, 0.15344436466693878, 1.1760369539260864, -84.88064575195312, 0.0006413722294382751, 0.00006606439274037257, 0.896777331829071]];
    var homographiesSienceParkH2 = [[0.59467011690139771, -0.023367745801806452, 140.587615966796883, -0.104356661438941964, 0.7485773563385015, 45.653278350830086, -0.00041533523472025997, -0.000075649084465112548, 0.8931218385696411]];

    console.log("image Set 6");
    allHomographies = [homographiesSienceParkH1,homographiesSienceParkH2];  
    imagesRef = ["../imgs/sciencepark/P1100328.jpg", "../imgs/sciencepark/P1100329.jpg"];
}else if(imageSet == 7){
    // //bird
    var homographiesBirdH1 = [[1.0095304250717163, -0.016554025933146477, 8.953278541564941, 0.03932776674628258, 1.01807701587677, -168.96636962890625, -0.000007351650765485829, 0.00010901226050918922, 0.9818366169929504]];
    var homographiesBirdH2 = [[0.97413450479507451, 0.016616482287645342, -6.2873034477233893, -0.0358386412262916564, 0.94844388961791995, 163.438446044921886, 0.0000127089397210511387, -0.000101570847618859268, 0.9824137687683105]];

    imagesRef = ["../imgs/bird/P1.jpg", "../imgs/bird/P2.jpg"];
    allHomographies = [homographiesBirdH1,homographiesBirdH2];  
}

var stitch = {};
var computedHs = {};
var canvasDiv = 'CANVAS';
var imagesReady = false;
var result_canvas;

var imageCanvases = {};
function enablestart() {
	if (imagesReady) {

        for (var i = 0; i < imagesRef.length; i++){
            computedHs[i] = { val: false, bool: false, H: allHomographies[i] };
        }

		stitch = imagewarp(canvasDiv, allHomographies[0], imagesRef, selView);
	}
}

$(window).load(function() {
	imagesReady = true;
	enablestart();
});

var selDiv1 = document.querySelector("#selectedF1");
placeimgs(imagesRef, selDiv1);


function placeimgs(images, wdiv){
	var filesArr = Array.prototype.slice.call(images);
	for (var i = 0; i < images.length; i++) 
	{
		var image = new Image();
		image.src = images[i];
		wdiv.appendChild(image);
	}
};

function findScale(){
	return 1;
}

function loadCanvas(id){
    var canvas = document.createElement('canvas');
    var div = document.getElementById(id); 
    canvas.id     = id;
    div.appendChild(canvas);

    return canvas;
};

function selView(){
    if(!localStorage.getItem('num')) {
        console.log("Non set", localStorage.getItem('num'));
    } else {
        console.log("number", localStorage.getItem('num'));
    }
    var mosaic2 = stitch.getMosaic2();
    selectview('canvas', mosaic2);
};


var blob;
function createImgObj(val){
    console.log("choose");
    var currentImagesRef = new Array(imagesRef.length);
    var rindx = 0;

    if(!computedHs[val].val){
        currentImagesRef[rindx++] = imagesRef[val];
        computedHs[val].val = true;
        for (var i = 0; i < imagesRef.length; i++){
            if (i != val){
                currentImagesRef[rindx++] = imagesRef[i];
                computedHs[i].val = false; 
            }
        }
        stitch = imagewarp(canvasDiv, computedHs[val].H, currentImagesRef, blobStuff);
    }   
}

function blobStuff(){
    if(!blob){
        blob = blobObj();
        blob.createBlobView();
    }else{
        blob.remove();
        blob.createBlobView();
    }
}


