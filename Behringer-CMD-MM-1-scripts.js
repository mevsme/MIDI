var CMDMM = new Object();

CMDMM.init = function (id) { 
	CMDMM.ch = ['[Microphone]', '[Channel1]', '[Channel2]', '[Auxiliary1]'];
	
	CMDMM.emptyConnection = {
		trigger : function () {return},
		disconnect : function () {return},
	}
	
	CMDMM.shiftStatus = false;
	
    CMDMM.inLibrary            = true; // TRUE = right | FALSE = left 
    CMDMM.rightFirstPress      = false; 
    CMDMM.focusMoved           = true; // variable to remember if track selector was moved or not, if moved press will load and play track again, if not, will fastforward or stop
    CMDMM.paused               = false;  
    CMDMM.timer                = null;
    CMDMM.longpress            = false;  
    CMDMM.orientation          = [[null, false, false], [null, false, false], [null, false, false], [null, false, false]]; // Null for shifting index
	
	// Special mode
	// The idea behind this mode is to be able to DJ only with one piece of MM-1.
	// The button 1 becomes CUE, the button 2 becomes PLAY
	CMDMM.sm = [0,0]; // 1 - first button pressed, 2 - second, 3 - special mode enabled
	CMDMM.spMode = false;

    uvl = engine.makeConnection('[Master]', 'VuMeterL', CMDMM.vuMeterUpdateL); uvl.trigger();
    uvr = engine.makeConnection('[Master]', 'VuMeterR', CMDMM.vuMeterUpdateR); uvr.trigger();
    
    CMDMM.pfl0 = engine.makeConnection(CMDMM.ch[0],'pfl', function(value) {midi.sendShortMsg(0x94, 0x30, value)}); CMDMM.pfl0.trigger();
    CMDMM.pfl1 = engine.makeConnection(CMDMM.ch[1],'pfl', function(value) {midi.sendShortMsg(0x94, 0x31, value)}); CMDMM.pfl1.trigger();
    CMDMM.pfl2 = engine.makeConnection(CMDMM.ch[2],'pfl', function(value) {midi.sendShortMsg(0x94, 0x32, value)}); CMDMM.pfl2.trigger();
    CMDMM.pfl3 = engine.makeConnection(CMDMM.ch[3],'pfl', function(value) {midi.sendShortMsg(0x94, 0x33, value)}); CMDMM.pfl3.trigger();
       
    CMDMM.b11 = engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_'+CMDMM.ch[0]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x13, value)}); CMDMM.b11.trigger();
    CMDMM.b12 = engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_'+CMDMM.ch[0]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x14, value)}); CMDMM.b12.trigger();
    CMDMM.b21 = engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_'+CMDMM.ch[1]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x17, value)}); CMDMM.b21.trigger();
    CMDMM.b22 = engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_'+CMDMM.ch[1]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x18, value)}); CMDMM.b22.trigger();
    CMDMM.b31 = engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_'+CMDMM.ch[2]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x1B, value)}); CMDMM.b31.trigger();
    CMDMM.b32 = engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_'+CMDMM.ch[2]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x1C, value)}); CMDMM.b32.trigger();
    CMDMM.b41 = engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_'+CMDMM.ch[3]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x1F, value)}); CMDMM.b41.trigger();
    CMDMM.b42 = engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_'+CMDMM.ch[3]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x20, value)}); CMDMM.b42.trigger();
	
	engine.softTakeover('[QuickEffectRack1_'+CMDMM.ch[0]+']', 'super1', true);
	engine.softTakeover('[QuickEffectRack1_'+CMDMM.ch[1]+']', 'super1', true);
	engine.softTakeover('[QuickEffectRack1_'+CMDMM.ch[2]+']', 'super1', true);
	engine.softTakeover('[QuickEffectRack1_'+CMDMM.ch[3]+']', 'super1', true);
	
	// Ping
	midi.sendShortMsg(0x94, 0x12, 0x01);
	
	// Just in case if fucked-up something xD
	//engine.setValue('[Channel1]', 'rateSearch', 0);
	//engine.setValue('[Channel2]', 'rateSearch', 0);
	//engine.setValue('[Channel3]', 'rateSearch', 0);
	//engine.setValue('[Channel4]', 'rateSearch', 0);
	//engine.setValue('[PreviewDeck1]', 'rateSearch', 0);
}

CMDMM.chSM = function (channel, control, value) { // Check SM
	if (value === 127) {
		
		if (control === 0x12) {
			CMDMM.sm[0] = 1;
		}
		if (control === 0x03) {
			CMDMM.sm[1] = 1; 
		}
	};
	
	if (value === 0) {
		if (control === 0x12) {
			CMDMM.sm[0] = 0; 
		}
		if (control === 0x03) {
			CMDMM.sm[1] = 0; 
		}
	}
	
	if (CMDMM.sm[0] === 1 && CMDMM.sm[1] === 1) {
		if (CMDMM.spMode === false) {
			CMDMM.spMode = true;
			
			engine.beginTimer(300, function () {midi.sendShortMsg(0x94, 0x12, 0x02);}, true);
			
			CMDMM.b11.disconnect(); 
			CMDMM.b12.disconnect(); 
			CMDMM.b21.disconnect(); 
			CMDMM.b22.disconnect(); 
			CMDMM.b31.disconnect(); 
			CMDMM.b32.disconnect(); 
			CMDMM.b41.disconnect(); 
			CMDMM.b42.disconnect(); 
			
			CMDMM.ori1.disconnect();
			CMDMM.ori2.disconnect();
			CMDMM.ori3.disconnect();
			CMDMM.ori4.disconnect();
			
			CMDMM.b11 = engine.makeConnection(CMDMM.ch[0], 'cue_indicator', function(value) {midi.sendShortMsg(0x94, 0x13, value)}); 
			if (typeof CMDMM.b11 === "undefined") CMDMM.b11 = CMDMM.emptyConnection;
			CMDMM.b11.trigger(); 
			CMDMM.b12 = engine.makeConnection(CMDMM.ch[0], 'play',          function(value) {midi.sendShortMsg(0x94, 0x14, value)}); 
			if (typeof CMDMM.b12 === "undefined") CMDMM.b12 = CMDMM.emptyConnection;
			CMDMM.b12.trigger(); 
			CMDMM.b21 = engine.makeConnection(CMDMM.ch[1], 'cue_indicator', function(value) {midi.sendShortMsg(0x94, 0x17, value)}); 
			if (typeof CMDMM.b21 === "undefined") CMDMM.b21 = CMDMM.emptyConnection;
			CMDMM.b21.trigger(); 
			CMDMM.b22 = engine.makeConnection(CMDMM.ch[1], 'play',          function(value) {midi.sendShortMsg(0x94, 0x18, value)}); 
			if (typeof CMDMM.b22 === "undefined") CMDMM.b22 = CMDMM.emptyConnection;
			CMDMM.b22.trigger(); 
			CMDMM.b31 = engine.makeConnection(CMDMM.ch[2], 'cue_indicator', function(value) {midi.sendShortMsg(0x94, 0x1B, value)}); 
			if (typeof CMDMM.b31 === "undefined") CMDMM.b31 = CMDMM.emptyConnection;
			CMDMM.b31.trigger(); 
			CMDMM.b32 = engine.makeConnection(CMDMM.ch[2], 'play',          function(value) {midi.sendShortMsg(0x94, 0x1C, value)}); 
			if (typeof CMDMM.b32 === "undefined") CMDMM.b32 = CMDMM.emptyConnection;
			CMDMM.b32.trigger(); 
			CMDMM.b41 = engine.makeConnection(CMDMM.ch[3], 'cue_indicator', function(value) {midi.sendShortMsg(0x94, 0x1F, value)}); 
			if (typeof CMDMM.b41 === "undefined") CMDMM.b41 = CMDMM.emptyConnection;
			CMDMM.b41.trigger(); 
			CMDMM.b42 = engine.makeConnection(CMDMM.ch[3], 'play',          function(value) {midi.sendShortMsg(0x94, 0x20, value)}); 
			if (typeof CMDMM.b42 === "undefined") CMDMM.b42 = CMDMM.emptyConnection;
			CMDMM.b42.trigger(); 
		
		} else if (CMDMM.spMode) {
			
			CMDMM.spMode = false;
			midi.sendShortMsg(0x94, 0x12, 0x00);
		
			CMDMM.b11.disconnect(); 
			CMDMM.b12.disconnect(); 
			CMDMM.b21.disconnect(); 
			CMDMM.b22.disconnect(); 
			CMDMM.b31.disconnect(); 
			CMDMM.b32.disconnect(); 
			CMDMM.b41.disconnect(); 
			CMDMM.b42.disconnect(); 
			
			engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_'+CMDMM.ch[0]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x13, value)}); CMDMM.b11.trigger();
			engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_'+CMDMM.ch[0]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x14, value)}); CMDMM.b12.trigger();
			engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_'+CMDMM.ch[1]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x17, value)}); CMDMM.b21.trigger();
			engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_'+CMDMM.ch[1]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x18, value)}); CMDMM.b22.trigger();
			engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_'+CMDMM.ch[2]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x1B, value)}); CMDMM.b31.trigger();
			engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_'+CMDMM.ch[2]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x1C, value)}); CMDMM.b32.trigger();
			engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_'+CMDMM.ch[3]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x1F, value)}); CMDMM.b41.trigger();
			engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_'+CMDMM.ch[3]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x20, value)}); CMDMM.b42.trigger();
		}
	}
}

CMDMM.vuMeterUpdateL = function (value, group, control) {
    value = (value * 15) + 48;
    midi.sendShortMsg(0xB4, 80, value);
}

CMDMM.vuMeterUpdateR = function (value, group, control) {
    value = (value * 15) + 48;
    midi.sendShortMsg(0xB4, 81, value);
}

CMDMM.orienLED = function (value, group, control) {
	switch (group) {
		case CMDMM.ch[0]:
			if (value === 0) midi.sendShortMsg(0x94, 0x13, 0x01), midi.sendShortMsg(0x94, 0x14, 0x00);
			if (value === 2) midi.sendShortMsg(0x94, 0x13, 0x00), midi.sendShortMsg(0x94, 0x14, 0x01);
			if (value === 1) midi.sendShortMsg(0x94, 0x13, 0x01), midi.sendShortMsg(0x94, 0x14, 0x01);
		break;
		case CMDMM.ch[1]:
			if (value === 0) midi.sendShortMsg(0x94, 0x17, 0x01), midi.sendShortMsg(0x94, 0x18, 0x00);
			if (value === 2) midi.sendShortMsg(0x94, 0x17, 0x00), midi.sendShortMsg(0x94, 0x18, 0x01);
			if (value === 1) midi.sendShortMsg(0x94, 0x17, 0x01), midi.sendShortMsg(0x94, 0x18, 0x01);
		break;
		case CMDMM.ch[2]:
			if (value === 0) midi.sendShortMsg(0x94, 0x1B, 0x01), midi.sendShortMsg(0x94, 0x1C, 0x00);
			if (value === 2) midi.sendShortMsg(0x94, 0x1B, 0x00), midi.sendShortMsg(0x94, 0x1C, 0x01);
			if (value === 1) midi.sendShortMsg(0x94, 0x1B, 0x01), midi.sendShortMsg(0x94, 0x1C, 0x01);
		break;
		case CMDMM.ch[3]:
			if (value === 0) midi.sendShortMsg(0x94, 0x1F, 0x01), midi.sendShortMsg(0x94, 0x20, 0x00);
			if (value === 2) midi.sendShortMsg(0x94, 0x1F, 0x00), midi.sendShortMsg(0x94, 0x20, 0x01);
			if (value === 1) midi.sendShortMsg(0x94, 0x1F, 0x01), midi.sendShortMsg(0x94, 0x20, 0x01);
		break;
	}
}
 
CMDMM.shift = function(channel, control, value, status, group) {
    if (value === 127) {
		
		if (!CMDMM.spMode) {
			midi.sendShortMsg(0x94, 0x12, 0x00);
			
			CMDMM.b11.disconnect();
			CMDMM.b12.disconnect();
			CMDMM.b21.disconnect();
			CMDMM.b22.disconnect();
			CMDMM.b31.disconnect();
			CMDMM.b32.disconnect();
			CMDMM.b41.disconnect();
			CMDMM.b42.disconnect();
			 
			CMDMM.ori1 = engine.makeConnection(CMDMM.ch[0], 'orientation', CMDMM.orienLED); CMDMM.ori1.trigger();
			CMDMM.ori2 = engine.makeConnection(CMDMM.ch[1], 'orientation', CMDMM.orienLED); CMDMM.ori2.trigger();
			CMDMM.ori3 = engine.makeConnection(CMDMM.ch[2], 'orientation', CMDMM.orienLED); CMDMM.ori3.trigger();
			CMDMM.ori4 = engine.makeConnection(CMDMM.ch[3], 'orientation', CMDMM.orienLED); CMDMM.ori4.trigger();
		}
		CMDMM.shiftStatus = true;
		CMDMM.chSM(channel, control, value);
		
		return;
    }
	
	if (value === 0) {

		CMDMM.shiftStatus = false;
		 
		if (!CMDMM.spMode) {
			
			midi.sendShortMsg(0x94, 0x12, 0x01);
			
			CMDMM.ori1.disconnect();
			CMDMM.ori2.disconnect();
			CMDMM.ori3.disconnect();
			CMDMM.ori4.disconnect();
		
			CMDMM.b11 = engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_'+CMDMM.ch[0]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x13, value)}); CMDMM.b11.trigger();
			CMDMM.b12 = engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_'+CMDMM.ch[0]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x14, value)}); CMDMM.b12.trigger();
			CMDMM.b21 = engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_'+CMDMM.ch[1]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x17, value)}); CMDMM.b21.trigger();
			CMDMM.b22 = engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_'+CMDMM.ch[1]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x18, value)}); CMDMM.b22.trigger();
			CMDMM.b31 = engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_'+CMDMM.ch[2]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x1B, value)}); CMDMM.b31.trigger();
			CMDMM.b32 = engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_'+CMDMM.ch[2]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x1C, value)}); CMDMM.b32.trigger();
			CMDMM.b41 = engine.makeConnection('[EffectRack1_EffectUnit1]', 'group_'+CMDMM.ch[3]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x1F, value)}); CMDMM.b41.trigger();
			CMDMM.b42 = engine.makeConnection('[EffectRack1_EffectUnit2]', 'group_'+CMDMM.ch[3]+'_enable', function(value) {midi.sendShortMsg(0x94, 0x20, value)}); CMDMM.b42.trigger();
		}
		
		return;
	}
}  

CMDMM.librarySwitch = function (channel, control, value, status, group) {
    // Focus is on the right side and cycles through tracks of current view 
    if (CMDMM.inLibrary) { 
        if (control === 0x03 && value === 0x7F) {
			if (CMDMM.shiftStatus) {CMDMM.chSM(channel, control, value); return};
            engine.setValue('[Playlist]', 'LoadSelectedIntoFirstStopped', 1);
        } else {
			// Fire on release
			CMDMM.chSM(channel, control, value);
		}
        
        if (control === 0x03 && status === 0xB4 && value === 0x41) {
            engine.setValue('[Playlist]','SelectNextTrack',1);
            CMDMM.ctrlcusMoved = true;
        }
        
        if (control === 0x03 && status === 0xB4 && value === 0x3F) {
            engine.setValue('[Playlist]','SelectPrevTrack',1);
            CMDMM.ctrlcusMoved = true;
        }
        
		// short press [RIGHT] = preview, long press [RIGHT] - fast forward prefiew, 
		// short press - pause / load new track into preview deck
        if (!CMDMM.rightFirstPress) {
			
            if (control === 0x11) { 
				if (value === 127) {
						

					CMDMM.longpress = false;
					
					CMDMM.timer = engine.beginTimer(500, function() {engine.setValue('[PreviewDeck1]', 'rateSearch', 45); CMDMM.longpress = true;}, true);
				}
				if (value === 0) {
					if (CMDMM.timer) engine.stopTimer(CMDMM.timer);
					if (CMDMM.longpress === true) {
						engine.setValue('[PreviewDeck1]', 'rateSearch', 0);
						return;
					} 
					
					if (CMDMM.ctrlcusMoved === true) { //"focus" means 'current track' selector
						
						engine.setValue('[PreviewDeck1]', 'LoadSelectedTrack', 1);
						engine.beginTimer(200, function() {engine.setValue('[PreviewDeck1]', 'start_play', 1)}, true);
						CMDMM.ctrlcusMoved = false;
						CMDMM.paused     = false;
						
					} else {
						script.toggleControl('[PreviewDeck1]', 'play');
					}
                }
            }         
        }
  
    CMDMM.rightFirstPress = false;    
        
    // Focus moved left and cycles through 'Tracks', 'AutoDJ', 'Playlists', etc.     
    } else if (!CMDMM.inLibrary) { 
        
        if (control === 0x03 && status === 0x94) {
			if (CMDMM.shiftStatus) {CMDMM.chSM(channel, control, value); return};
            engine.setValue('[Playlist]','ToggleSelectedSidebarItem',1);
        }
        
        if (control === 0x03 && status === 0xB4 && value === 0x41) {
            engine.setValue('[Playlist]','SelectNextPlaylist',1);
        }
        
        if (control === 0x03 && status === 0xB4 && value === 0x3F) {
            engine.setValue('[Playlist]','SelectPrevPlaylist',1);
        }
    }
    
    if (CMDMM.inLibrary) {
        if (control === 0x10 && value === 127) {
            CMDMM.inLibrary = false;
            CMDMM.rightFirstPress = true;
        }
    } else {
        if (control === 0x11 && value === 127) {
            CMDMM.inLibrary  = true;
            //CMDMM.ctrlcusMoved = false;
        }
    }
}

CMDMM.fader = function (channel, control, value, status, group) {
    value = script.absoluteLin(value, 0, 1);

    switch (control) {
        case 0x30: engine.setParameter(CMDMM.ch[0], 'volume', value); break;
        case 0x31: engine.setParameter(CMDMM.ch[1], 'volume', value); break;
        case 0x32: engine.setParameter(CMDMM.ch[2], 'volume', value); break;
        case 0x33: engine.setParameter(CMDMM.ch[3], 'volume', value); break;
        
        case 0x06: if (CMDMM.shiftStatus) {engine.setParameter(CMDMM.ch[0], 'pregain', value);} else {engine.setParameter('[EqualizerRack1_'+CMDMM.ch[0]+'_Effect1]', 'parameter3', value)}; break; 
        case 0x07: if (CMDMM.shiftStatus) {engine.setParameter(CMDMM.ch[1], 'pregain', value);} else {engine.setParameter('[EqualizerRack1_'+CMDMM.ch[1]+'_Effect1]', 'parameter3', value)}; break; 
        case 0x08: if (CMDMM.shiftStatus) {engine.setParameter(CMDMM.ch[2], 'pregain', value);} else {engine.setParameter('[EqualizerRack1_'+CMDMM.ch[2]+'_Effect1]', 'parameter3', value)}; break; 
        case 0x09: if (CMDMM.shiftStatus) {engine.setParameter(CMDMM.ch[3], 'pregain', value);} else {engine.setParameter('[EqualizerRack1_'+CMDMM.ch[3]+'_Effect1]', 'parameter3', value)}; break; 
        
        case 0x0a: engine.setParameter('[EqualizerRack1_'+CMDMM.ch[0]+'_Effect1]', 'parameter2', value); break;    
        case 0x0b: engine.setParameter('[EqualizerRack1_'+CMDMM.ch[1]+'_Effect1]', 'parameter2', value); break;    
        case 0x0c: engine.setParameter('[EqualizerRack1_'+CMDMM.ch[2]+'_Effect1]', 'parameter2', value); break;    
        case 0x0d: engine.setParameter('[EqualizerRack1_'+CMDMM.ch[3]+'_Effect1]', 'parameter2', value); break; 
            
        case 0x0e: engine.setParameter('[EqualizerRack1_'+CMDMM.ch[0]+'_Effect1]', 'parameter1', value); break;     
        case 0x0f: engine.setParameter('[EqualizerRack1_'+CMDMM.ch[1]+'_Effect1]', 'parameter1', value); break;     
        case 0x10: engine.setParameter('[EqualizerRack1_'+CMDMM.ch[2]+'_Effect1]', 'parameter1', value); break;     
        case 0x11: engine.setParameter('[EqualizerRack1_'+CMDMM.ch[3]+'_Effect1]', 'parameter1', value); break;    
        
        case 0x12: 
			if (engine.getValue('[EffectRack1_EffectUnit1]', 'group_'+CMDMM.ch[0]+'_enable')) {
				engine.setParameter('[EffectRack1_EffectUnit1]', 'super1', value);
				break;
			}
			if (engine.getValue('[EffectRack1_EffectUnit2]', 'group_'+CMDMM.ch[0]+'_enable')) {
				engine.setParameter('[EffectRack1_EffectUnit2]', 'super1', value);
				break;
			}
			engine.setParameter('[QuickEffectRack1_'+CMDMM.ch[0]+']', 'super1', value);
		break; 
		
		break;     
        case 0x13: 
			if (engine.getValue('[EffectRack1_EffectUnit1]', 'group_'+CMDMM.ch[1]+'_enable')) {
				engine.setParameter('[EffectRack1_EffectUnit1]', 'super1', value);
				break;
			}
			if (engine.getValue('[EffectRack1_EffectUnit2]', 'group_'+CMDMM.ch[1]+'_enable')) {
				engine.setParameter('[EffectRack1_EffectUnit2]', 'super1', value);
				break;
			}
			engine.setParameter('[QuickEffectRack1_'+CMDMM.ch[1]+']', 'super1', value);
			
		break;   
		
        case 0x14: 
			if (engine.getValue('[EffectRack1_EffectUnit1]', 'group_'+CMDMM.ch[2]+'_enable')) {
				engine.setParameter('[EffectRack1_EffectUnit1]', 'super1', value);
				break;
			}
			if (engine.getValue('[EffectRack1_EffectUnit2]', 'group_'+CMDMM.ch[2]+'_enable')) {
				engine.setParameter('[EffectRack1_EffectUnit2]', 'super1', value);
				break;
			}
			engine.setParameter('[QuickEffectRack1_'+CMDMM.ch[2]+']', 'super1', value);
		break; 
		
        case 0x15: 
			if (engine.getValue('[EffectRack1_EffectUnit1]', 'group_'+CMDMM.ch[3]+'_enable')) {
				engine.setParameter('[EffectRack1_EffectUnit1]', 'super1', value);
				break;
			}
			if (engine.getValue('[EffectRack1_EffectUnit2]', 'group_'+CMDMM.ch[3]+'_enable')) {
				engine.setParameter('[EffectRack1_EffectUnit2]', 'super1', value);
				break;
			}
			engine.setParameter('[QuickEffectRack1_'+CMDMM.ch[3]+']', 'super1', value);
		break;  
    }
}

CMDMM.button = function (channel, control, value, status, group) {
    switch (control) {
        //CUE deck 127/0
        case 0x30:
			CMDMM.cue(0, value);
        break;
			
        case 0x31:
			CMDMM.cue(1, value);
		break;
		
        case 0x32:
			CMDMM.cue(2, value);
		break;
		
        case 0x33:
			CMDMM.cue(3, value);
		break;
            
        //1-2 
        case 0x13:
			CMDMM.oneTwo(0, 1, value);
        break;
			
        case 0x14:
			CMDMM.oneTwo(0, 2, value);
        break;
		
		case 0x17:
			CMDMM.oneTwo(1, 1, value);
        break;
			
        case 0x18:
			CMDMM.oneTwo(1, 2, value);
        break;
		
        case 0x1B:
			CMDMM.oneTwo(2, 1, value);
        break;
			
        case 0x1C:
			CMDMM.oneTwo(2, 2, value);
        break;
		
        case 0x1F:
			CMDMM.oneTwo(3, 1, value);
        break;
			
        case 0x20:
			CMDMM.oneTwo(3, 2, value);
        break;
    }
}

CMDMM.cue = function (deck, value) {
	if (value === 127) {
		if (CMDMM.shiftStatus) {
			if (CMDMM.spMode) {
				engine.setValue(CMDMM.ch[deck], 'beatsync', 1);
				midi.sendShortMsg(0x94, (0x30 + deck), 0x01);
			}
			
			// Nothing for SHIFT
		} else {
			script.toggleControl(CMDMM.ch[deck], 'pfl');
			if (engine.getValue(CMDMM.ch[deck], 'pfl')) {
				
				uvl.disconnect();
				uvr.disconnect();
				uvl = engine.makeConnection(CMDMM.ch[deck], 'VuMeterL', CMDMM.vuMeterUpdateL); uvl.trigger();
				uvr = engine.makeConnection(CMDMM.ch[deck], 'VuMeterR', CMDMM.vuMeterUpdateR); uvr.trigger();
			} else {
				uvl.disconnect();
				uvr.disconnect();
				uvl = engine.makeConnection('[Master]', 'VuMeterL', CMDMM.vuMeterUpdateL); uvl.trigger();
				uvr = engine.makeConnection('[Master]', 'VuMeterR', CMDMM.vuMeterUpdateR); uvr.trigger();
			}
		}
		
		
		
	}
	if (value === 0) {
		if (CMDMM.shiftStatus) {
			if (CMDMM.spMode) {
				engine.setValue(CMDMM.ch[deck], 'beatsync', 0);
				midi.sendShortMsg(0x94, (0x30 + deck), 0x00);
				var name = 'pfl' + deck;
				CMDMM[name].trigger(); // LED
				return;
			}
		}
	}
}

// CMDMM.timer     
// CMDMM.longpress 

CMDMM.oneTwo = function (deck, button, value) {
	if (value === 127) {
		// Check two buttons pressed together
		CMDMM.orientation[deck][button] = true;
		
		if (CMDMM.shiftStatus) {
			if (CMDMM.spMode) {
				switch (button) {
					case 1: 
						engine.setValue(CMDMM.ch[deck], 'rateSearch', -2); 
						CMDMM.timer = engine.beginTimer(1500, function () {engine.setValue(CMDMM.ch[deck], 'rateSearch', -20);}, true);
						break;
					case 2: 
						engine.setValue(CMDMM.ch[deck], 'rateSearch', 2); 
						CMDMM.timer = engine.beginTimer(1500, function () {engine.setValue(CMDMM.ch[deck], 'rateSearch', 20);}, true);
						break;
				}
				return;
			}
			
			switch (button) {
				case 1: engine.setValue(CMDMM.ch[deck], 'orientation', 0); break;
				case 2: engine.setValue(CMDMM.ch[deck], 'orientation', 2); break;
			}
			
			if (CMDMM.orientation[deck][1] === true && CMDMM.orientation[deck][2] === true) {
				engine.setValue(CMDMM.ch[deck], 'orientation', 1);
			}
			
			return;
				
		} 
		
		if (CMDMM.spMode) {
			switch (button) {
				case 1: engine.setValue(CMDMM.ch[deck], 'cue_default', 1); break;
				case 2: script.toggleControl(CMDMM.ch[deck], 'play'); break;
			}
			
			return;
		}
		
		//
		script.toggleControl('[EffectRack1_EffectUnit' + button + ']', 'group_'+CMDMM.ch[deck]+'_enable', value);
		return;
	}
	
	if (value === 0) {
		// Release
		CMDMM.orientation[deck][button] = false;
		
		if (CMDMM.shiftStatus) {
			if (CMDMM.spMode) {
				if (CMDMM.timer) engine.stopTimer(CMDMM.timer);
				engine.setValue(CMDMM.ch[deck], 'rateSearch', 0);
				return;
			}
		}
		if (CMDMM.spMode) {
			switch (button) {
				case 1: engine.setValue(CMDMM.ch[deck], 'cue_default', 0); break;
			}
		}
	}
}

CMDMM.shutdown = function() {
	for (var i = 0; i <= 0x30; i++) {
		midi.sendShortMsg(0x94, i, 0x00); 
		midi.sendShortMsg(0xB4, i, 0x00);  
	} 
}