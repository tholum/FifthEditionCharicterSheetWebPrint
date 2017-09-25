Number.prototype.AlwaysSymbol = function(){
    return (( this > 0 ) ? '+' : "" ) + this;
}
function AS2Mod(stat) { 
    let s = Math.ceil((parseInt(stat) - 1) / 2) - 5; 
    if( s >= 1){
        return String( "+" + s );
    } else {
        return String( s );
    }
}
function Level2ProfBonus( level ){
    level = level - 1;
    return 2 + Math.floor( level / 4 );
}

var Weapon = function( stats , character ){
    var self = this;
    self.name = ko.observable( stats[0] );
    self.range = ko.observable( stats[1] );
    self.type = ko.observable( stats[2] );

}

var Character = function(file ){
    var self = this;
    self.skillInfo = ko.observableArray();
    self.SkillTypes = [
        { "name" :"Acrobatics" ,        "base" : "Dexterity"},
        { "name" : "Animal Handling" ,  "base" : "Wisdom"},
        { "name" : "Arcana" ,           "base" : "Intelligence"},
        { "name" : "Athletics" ,        "base" : "Strength"},
        { "name" : "Deception" ,        "base" : "Charisma"},
        { "name" : "History",           "base" : "Intelligence"},
        { "name" : "Insight" ,          "base" : "Wisdom"},
        { "name" : "Intimidation",      "base" : "Charisma"},
        { "name" : "Investigation",     "base" : "Intelligence"},
        { "name" : "Medicine" ,         "base" : "Wisdom"},
        { "name" : "Nature",            "base" : "Intelligence"},
        { "name" : "Perception" ,       "base" : "Wisdom"},
        { "name" : "Performance" ,      "base" : "Charisma"},
        { "name" : "Persuasion" ,       "base" : "Charisma"},
        { "name" : "Religion" ,         "base" : "Intelligence"},
        { "name" : "Sleigth of Hand" ,  "base" : "Dexterity"},
        { "name" : "Stelth" ,           "base" : "Dexterity"},
        { "name" : "Survival",          "base" : "Wisdom" }
    ];
    self.skillInfoClean = ko.computed( function(){
        let SkillTypes = JSON.parse( JSON.stringify( self.SkillTypes ));
        var skillInfo = self.skillInfo();
        SkillTypes.sort(function (a, b) {
            let tmpOrder = ["Strength", "Dexterity", "Intelligence", "Wisdom", "Charisma"]
            var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase() , baseA = a.base.toLowerCase() , baseB = b.base.toLowerCase();
            if (tmpOrder.indexOf(a.base) < tmpOrder.indexOf(b.base)) {
                return -1;
            }
            if (tmpOrder.indexOf(a.base) > tmpOrder.indexOf(b.base)) {
                return 1;
            }
            if (nameA < nameB){
                return -1;
            }
            if (nameA > nameB){
                return 1;
            }
            
            return 0; //default return value (no sorting)
        });
        if( skillInfo.length >= 18 ){
            for (i = 0; i < 18; i++) { 
                SkillTypes[i].proficient = skillInfo[i] == "true";
            }
        }
        let SkillTypesClean = JSON.parse(JSON.stringify(self.SkillTypes));
        SkillTypesClean.forEach( function( skill ){
            match = ko.utils.arrayFirst(SkillTypes , function( tmpSkill){
                return skill.name == tmpSkill.name;
            } );
            if( match ){
                skill.proficient = match.proficient;
            }
        });
        return SkillTypesClean;
    });
    self.Name = ko.observable();
    self.ClassName = ko.observable();
    self.Race = ko.observable();
    self.HitDice = ko.observable();
    self.ArmorBonus = ko.observable();
    self.MaxHealth = ko.observable();
    self.Features = ko.observableArray();
    self.Resources = ko.observableArray();
    self.Languages = ko.observableArray();
    self.Proficiencies = ko.computed( function(){
        var p = [];
        p = p.concat( self.Languages() );
        return p;
    })
    self.CleanResources = ko.computed( function(){
        var res = self.Resources();
        var rv = [];
        res.forEach(function( res){
            if( res[8] != -1 ){
                var txt = [];
                txt.push( res[1]);
                if( res[5] >= 1 && res[5] >= res[6] ){
                    txt.push( res[5] + " per rest" );
                } else if ( res[6] >= 1 ){
                    if( res[5] >= 1){
                        txt.push(res[5] + " per short rest");
                    }
                    txt.push(res[6] + " per long rest");
                }
                rv.push( txt.join(" : "));
            }
        });
        return rv;
    })
    self.Background = ko.observable();
    self.ArchetypeName = ko.observable();
    self.ClassLevel = ko.observable();
    self.SpellProgressionCode = ko.observable();
    self.classInfo = ko.observableArray();
    self.Stats = ko.observableArray();
    ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"].forEach(
        function( name , index ){
            self[name] = ko.computed(function () {
                var stats = self.Stats();
                if (stats.length > 6) {
                    return stats[index];
                } else {
                    return -1;
                }
            });
            self[name + "Proficient"] = ko.computed(function () {
                var stats = self.Stats();
                if (stats.length > 6) {
                    return stats[index + 6 ] == "true";
                } else {
                    return -1;
                }
            });
            
        }
    );

    self.file = ko.observable( file );
    self.CharXml = ko.observable( false );
    self.weaponSet = ko.observable(false);
    self.weapons = ko.computed( function(){
        var ws = self.weaponSet();
        if( ws ){
            var split = ws.split( String.fromCharCode( 8864 ) );
            var ct = split[0];
            var wps = [];
            let i = 0;
            while( i < ct ){
                //wps.push( new Weapon(  split.slice( ( i * 13 ) + 1 , ( i * 13 ) + 14  ) , self )  );
                wps.push( split.slice( ( i * 13 ) + 1 , ( i * 13 ) + 14  )  );
                i++;
            }
            return wps;
        } else {
            return [];
        }
    });
    self.getCharicter = function(){
        $.get( file  , function( data ){ self.CharXml( data ); } );
    }

    self.CharXml.subscribe( function(xml){
        let classInfo = String($(self.CharXml()).find("classData").text()).split(String.fromCharCode(8863) );
        let noteList = String($(self.CharXml()).find("noteList").text()).split(String.fromCharCode(8864));
        let skillInfo = String($(self.CharXml()).find("skillInfo").text()).split(String.fromCharCode(8864));
        let hitDiceList = String($(self.CharXml()).find("hitDiceList").text()).split(String.fromCharCode(8864));
        self.HitDice(hitDiceList );
        self.ArmorBonus( String($(self.CharXml()).find("armorBonus").text())) ;
        self.MaxHealth(String($(self.CharXml()).find("maxHealth").text()));
        if( skillInfo.length >= 18){
            self.skillInfo(skillInfo.splice(0, 18));
        }
        if (noteList.length >= 15 ){
            self.Languages(
                ko.utils.arrayFilter(noteList[4].split("\n") , function(n){
                    return n != "";
                })
            );
            console.log(noteList);
            self.Name( noteList[15]);
        }
        var cleanNotes = ko.utils.arrayFilter(noteList[0].split("\n"), function (str) { 
            return str.indexOf("Features:") == -1 && str.indexOf("Feature:") == -1; 
        });
        self.Features(cleanNotes );
        self.classInfo(classInfo);
        if (classInfo.length >= 14 ){
            var co1 = classInfo[0].split(String.fromCharCode(8865) );
            self.ClassName(co1[0]);
            self.ArchetypeName(co1[1]);
            self.ClassLevel(co1[2]);
            self.SpellProgressionCode(co1[3]);
            self.Background( classInfo[9]);
            self.Race( classInfo[7]);    
            let Resources = classInfo[2].split(String.fromCharCode(8864));
            let tmpRes = [];
            Resources.forEach( function( res){
                let ar = res.split( String.fromCharCode( 8865) );
                if( ar.length == 10 ){
                    tmpRes.push( ar );
                }
            });
            self.Resources( tmpRes );
        }
        self.Stats( String($(self.CharXml()).find("abilityScores").text()).split(String.fromCharCode(8864) ) );
        self.weaponSet( $( self.CharXml() ).find( "weaponList" ).text() )
    });


    self.getCharicter();
    
}
//var Garok = ;