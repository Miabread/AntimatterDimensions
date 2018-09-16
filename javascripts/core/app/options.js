document.getElementById("theme").onclick = function() {
    let themes = Themes.available();
    let current = themes.indexOf(Theme.current());
    let next = Math.wrap(current + 1, 0, themes.length - 1);
    let theme = themes[next];
    theme.set();
};

document.getElementById("notation").onclick = function() {
    let notations = [
        "Scientific",
        "Engineering",
        "Letters",
        "Standard",
        "Cancer",
        "Mixed scientific",
        "Mixed engineering",
        "Logarithm",
        "Brackets",
        "Infinity"
    ];
    player.options.scientific = !player.options.scientific;
    let currentIndex = notations.indexOf(player.options.notation);
    let nextIndex = Math.wrap(currentIndex + 1, 0, notations.length - 1);
    Notation.set(notations[nextIndex]);
};

document.getElementById("newsbtn").onclick = function() {
    if (!player.options.newsHidden) {
        document.getElementById("game").style.display = "none";
        player.options.newsHidden = true
    } else {
        document.getElementById("game").style.display = "block";
        player.options.newsHidden = false;
        scrollNextMessage()
    }
};

document.getElementById("retry").onclick = function() {
    player.options.retryChallenge = !player.options.retryChallenge;
    updateOptionsButtons();
};

document.getElementById("exportbtn").onclick = function () {
    let output = document.getElementById('exportOutput');
    let parent = output.parentElement;

    parent.style.display = "";
    output.value = btoa(JSON.stringify(player, function(k, v) { return (v === Infinity) ? "Infinity" : v; }));

    output.onblur = function() {
        parent.style.display = "none";
    };

    output.focus();
    output.select();

    if (player.pastebinkey) {
        $.ajax({
            type: "POST",
            url: "http://pastebin.com/api/api_post.php",
            data: {
                api_option: "paste",
                api_dev_key: player.pastebinkey,
                api_paste_name: Date.now(),
                api_paste_code: encodeURIComponent(output.value)
            },
            success: function(response) {
                window.open(response)
            },
            fail: function(response) {
                console.log(response)
            }
        })
    }

    try {
        if (document.execCommand('copy')) {
            $.notify("exported to clipboard", "info");
            output.blur();
        }
    } catch(ex) {
        // well, we tried.
    }
};

document.getElementById("importbtn").onclick = function() {
    var save_data = prompt("Input your save. (if you import a valid save, your current save file will be overwritten!)");
    if (save_data.constructor !== String) save_data = "";
    if (sha512_256(save_data.replace(/\s/g, '').toUpperCase()) === "80b7fdc794f5dfc944da6a445a3f21a2d0f7c974d044f2ea25713037e96af9e3") {
        document.getElementById("body").style.animation = "barrelRoll 5s 1";
        giveAchievement("Do a barrel roll!");
        setTimeout(function(){ document.getElementById("body").style.animation = ""; }, 5000)
    }
    if (sha512_256(save_data.replace(/\s/g, '').toUpperCase()) === "857876556a230da15fe1bb6f410ca8dbc9274de47c1a847c2281a7103dd2c274") giveAchievement("So do I");
    if (Theme.tryUnlock(save_data))
        return;
    save_data = JSON.parse(atob(save_data), function(k, v) { return (v === Infinity) ? "Infinity" : v; });
    console.log(verify_save(save_data));
    if(verify_save(save_data)) forceHardReset = true;
    if(verify_save(save_data)) document.getElementById("reset").click();
    forceHardReset = false;
    if (!save_data || !verify_save(save_data)) {
        alert('could not load the save..');
        load_custom_game();
        return;
    }
    saved = 0;
    totalMult = 1;
    currentMult = 1;
    infinitiedMult = 1;
    achievementMult = 1;
    challengeMult = 1;
    unspentBonus = 1;
    infDimPow = 1;
    postc8Mult = new Decimal(0);
    mult18 = new Decimal(1);
    ec10bonus = new Decimal(1);
    player = save_data;
    console.log(player);
    save_game(false, true);
    console.log(player);
    load_game();
    console.log(player);
    updateChallenges();
    transformSaveToDecimal();

    function verify_save(obj) {
        return typeof obj === 'object';
    }
};

document.getElementById("confirmationoptionsbtn").onclick = function () {
    closeToolTip();
    document.getElementById("confirmationoptions").style.display = "flex";
};

document.getElementById("save").onclick = function() {
    saved++;
    if (saved > 99) giveAchievement("Just in case");
    save_game();
};

document.getElementById("load").onclick = function() {
    closeToolTip();
    for (var i = 0; i < 3; i++) {
        var _break = player.break;
        player.break = true;
        if (currentSave === i) document.querySelector("#save" + (i + 1) + " .save_antimatter").textContent = "Antimatter: " + shortenMoney(player.money);
        else document.querySelector("#save" + (i + 1) + " .save_antimatter").textContent = "Antimatter: " + shortenMoney(saves[i] ? new Decimal(saves[i].money) : 10);
        player.break = _break;
    }

    document.querySelectorAll(".save_selected").forEach(function(el) {
        el.style.display = "none";
    });

    document.querySelector("#save" + (currentSave + 1) + " .save_selected").style.display = "inline";

    document.getElementById("loadmenu").style.display = "flex";
};

document.getElementById("cloudsave").onclick = function() {
    playFabSaveCheck();
};

document.getElementById("cloudload").onclick = function() {
    playFabLoadCheck();
};

document.getElementById("cloudToggle").onclick = function() {
    player.options.cloud = !player.options.cloud;
    updateOptionsButtons();
};

document.getElementById("hotkeys").onclick = function() {
    player.options.hotkeys = !player.options.hotkeys;
    updateOptionsButtons();
};

document.getElementById("reset").onclick = function() {
    hardReset();
};

document.getElementById("commas").onclick = function() {
    player.options.commas = !player.options.commas;
    updateOptionsButtons();
};

var slider = document.getElementById("updaterateslider");
var sliderText = document.getElementById("updaterate");

slider.oninput = function() {
    player.options.updateRate = parseInt(this.value);
    sliderText.textContent = "Update rate: " + this.value + "ms";
    if (player.options.updateRate === 200) giveAchievement("You should download some more RAM");
    clearInterval(gameLoopIntervalId);
    gameLoopIntervalId = setInterval(gameLoop, player.options.updateRate);
};

document.getElementById("animationoptionsbtn").onclick = function () {
    closeToolTip();
    document.getElementById("animationoptions").style.display = "flex";
};

function updateOptionsButtons() {
    updateOnOffButton("retry", player.options.retryChallenge, "Automatically retry challenges");
    updateOnOffButton("cloudToggle", player.options.cloud, "Automatic cloud saving/loading");
    updateToggleButton("hotkeys", player.options.hotkeys, "Disable hotkeys", "Enable hotkeys");
    updateToggleButton("commas", player.options.commas, "Commas on exponents", "Notation on exponents");

    function updateOnOffButton(name, value, label) {
        updateToggleButton(name, value, label + " ON", label + " OFF");
    }

    function updateToggleButton(name, value, on, off) {
        document.getElementById(name).innerHTML = value ? on : off;
    }
}