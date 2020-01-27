var CMDDC = new Object();

CMDDC.padLigtsUpdate = function() {
	for (ctrl = 0x24, iter = 1; ctrl <= 0x33; ctrl++, iter++) {
		if (engine.getValue('[Sampler' + iter + ']', 'track_loaded')) {
			if (engine.getValue('[Sampler' + iter + ']', 'play')) {
				midi.sendShortMsg(0x95, ctrl, 0x02);
			} else midi.sendShortMsg(0x95, ctrl, 0x01);
			// print("Sample Loaded");
		} else midi.sendShortMsg(0x95, ctrl, 0x00);
	}
};

CMDDC.padMakeConnection = function (ctrl, iter) {
	engine.makeConnection('[Sampler' + iter + ']', 'play', function(value) {
		if (engine.getValue('[Sampler' + iter + ']', 'track_loaded') === 1) {
			if (value == 0) value = 1; else value = 2;
		} else {
			if (value == 0) value = 0; else value = 2; 
		}
		midi.sendShortMsg(0x95, ctrl, value);
	}); 
	
	engine.makeConnection('[Sampler' + iter + ']', 'eject', function(value) {
		midi.sendShortMsg(0x95, ctrl, value);
	});
	
	engine.makeConnection('[Sampler' + iter + ']', 'track_loaded', function(value) {
		midi.sendShortMsg(0x95, ctrl, value);
	});
}

CMDDC.chVolumeLed = function (num, value) {
	
	// var i = num - 1;
	// var ctrl = [0x14, 0x15, 0x16, 0x17, 0x10, 0x11, 0x12, 0x13];
	
	// var sig = engine.getValue('[Sampler'+num+']', 'pregain');
	// var led = Math.round(script.absoluteNonLinInverse(sig, 0, 1, 4, 1, 16));

	// midi.sendShortMsg(0xB5, ctrl[i], led);
	// if (CMDDC.tmp1) {CMDDC.light[1][i] = led} else CMDDC.light[0][i] = led; 
	// print(sig);
	// print(led);
}

CMDDC.gainLED = function (group) {
	var r = Math.round(script.absoluteNonLinInverse(engine.getValue(group, 'pregain'), 0, 1, 4, 1, 16));
	return(r);
}
 
CMDDC.init = function (id) { 
	
	// Get pregain light values
	for (i = 1; i <= 8; i++) {
		midi.sendShortMsg(0xB5, 0x0F + i, CMDDC.gainLED('[Sampler'+i+']'));
	}
	
	engine.makeConnection('[Sampler1]', 'pregain', function(value, group) {midi.sendShortMsg(0xB5, 0x10, CMDDC.gainLED(group))});
	engine.makeConnection('[Sampler2]', 'pregain', function(value, group) {midi.sendShortMsg(0xB5, 0x11, CMDDC.gainLED(group))});
	engine.makeConnection('[Sampler3]', 'pregain', function(value, group) {midi.sendShortMsg(0xB5, 0x12, CMDDC.gainLED(group))});
	engine.makeConnection('[Sampler4]', 'pregain', function(value, group) {midi.sendShortMsg(0xB5, 0x13, CMDDC.gainLED(group))});
	engine.makeConnection('[Sampler5]', 'pregain', function(value, group) {midi.sendShortMsg(0xB5, 0x14, CMDDC.gainLED(group))});
	engine.makeConnection('[Sampler6]', 'pregain', function(value, group) {midi.sendShortMsg(0xB5, 0x15, CMDDC.gainLED(group))});
	engine.makeConnection('[Sampler7]', 'pregain', function(value, group) {midi.sendShortMsg(0xB5, 0x16, CMDDC.gainLED(group))});
	engine.makeConnection('[Sampler8]', 'pregain', function(value, group) {midi.sendShortMsg(0xB5, 0x17, CMDDC.gainLED(group))});
	
	engine.makeConnection('[AutoDJ]', 'enabled', function(value) {midi.sendShortMsg(0x95, 0x03, value)});
	engine.makeConnection('[AutoDJ]', 'fade_now', function(value) {midi.sendShortMsg(0x95, 0x07, value)});
	
	engine.makeConnection('[Recording]', 'status', function(value) {midi.sendShortMsg(0x95, 0x04, value)});
	
	// Reset Light
	for (i = 0; i < 0x35; i++) {midi.sendShortMsg(0x95, i, 0x00)}
	
	for (ctrl = 0x24, iter = 1; ctrl <= 0x33; ctrl++, iter++) {
		if (engine.getValue('[Sampler' + iter + ']', 'track_loaded')) {
			midi.sendShortMsg(0x95, ctrl, 0x01);
			// print("Sample Loaded");
		} else midi.sendShortMsg(0x95, ctrl, 0x00);
		
		CMDDC.padMakeConnection(ctrl, iter);
	}
	
	 
	CMDDC.shift1 = false; // Hold to play Y/N, default is Don't hold
	CMDDC.shift2 = false; // Sync On/Off
	CMDDC.shift3 = false; // Loop Y/N
	CMDDC.shift4 = false; // PFL
	CMDDC.shift5 = false; // Stop
	CMDDC.shift6 = false; // Play
	CMDDC.orientation = false; // Orientation
	//CMDDC.shift8 = false; // Load to sampler Track 1-8
	CMDDC.shift9 = false; // Load to sampler Track 9-18
	
	
	CMDDC.tmp1 = false; // VOL Rot shift, Line 193
	//CMDDC.tmp2 = engine.getValue('[Samplers]', 'show_samplers');   // show samples
	CMDDC.tmp3 = false ;   // sampleRow1
	
	
	CMDDC.memoFive   = [0, 0, 0, 0, 
						0, 0, 0, 0, 
						0, 0, 0, 0, 
						0, 0, 0, 0];
	CMDDC.memoOne   = [0, 0, 0, 0, 
					   0, 0, 0, 0, 
					   0, 0, 0, 0, 
					   0, 0, 0, 0];
	CMDDC.memoTwo   = [0, 0, 0, 0, 
					   0, 0, 0, 0, 
					   0, 0, 0, 0, 
					   0, 0, 0, 0];
	CMDDC.memoSeven   = [1, 1, 1, 1, 
						 1, 1, 1, 1, 
						 1, 1, 1, 1, 
						 1, 1, 1, 1];
						 
						 
	
						  
	CMDDC.memoThree = [];
	
	CMDDC.LoadMode     = false; // SHIFT
	CMDDC.playRow = [false, false, false, false, false, false, false, false];
	
	CMDDC.whatPlay = null;
	
	for (i = 0; i < 16; i++) {
		CMDDC.memoThree[i] = engine.getValue('[Sampler' + (i + 1) + ']', 'repeat');
		//print(CMDDC.memoThree[i]);
	}
						  
	CMDDC.memoFour = [];
	for (i = 0; i < 16; i++) {
		CMDDC.memoFour[i] = engine.getValue('[Sampler' + (i + 1) + ']', 'pfl');
	}

	

};

 

CMDDC.button = function(channel, control, value, status, group) {
	
	switch (control) {
		case 0x00: if (value == 127) {if (CMDDC.LoadMode) break; engine.setValue('[Library]', 'AutoDjAddTop', 1)}  break;
		case 0x01: if (value == 127) {if (CMDDC.LoadMode) break; engine.setValue('[Channel1]', 'LoadSelectedTrack', 1)}  break;
		case 0x02: if (value == 127) {if (CMDDC.LoadMode) break; engine.setValue('[Channel2]', 'LoadSelectedTrack', 1)}  break;
		case 0x03: if (value == 127) {
			if (CMDDC.LoadMode) {
				script.toggleControl('[Samplers]', 'show_samplers');
				break;
			}
			script.toggleControl('[AutoDJ]', 'enabled');
		};  
		break;
		
		case 0x04: 
			if (value == 127) {
				if (CMDDC.LoadMode) {
					engine.setValue('[Recording]', 'toggle_recording', 1);
					break;
				}
				script.triggerControl('[Library]', 'AutoDjAddBottom', 1);
			}  
		break;
					
				
		case 0x05: 
			if (value == 127) {
				if (CMDDC.LoadMode) {break;}
				script.triggerControl('[Channel1]', 'CloneFromDeck', 2);
			}  
		break;
			
			
		case 0x06: if (value == 127) {if (CMDDC.LoadMode) break; script.triggerControl('[Channel2]', 'CloneFromDeck', 1)};  break;
		case 0x07: if (value == 127) {
				if (CMDDC.LoadMode) {engine.setValue('[Sampler]', 'LoadSamplerBank', 1); break;}
				script.triggerControl('[AutoDJ]', 'fade_now', 1);
			};  
		break;
		
		case 0x20: // Middle Rotary
			if (value == 127) {
				if (CMDDC.LoadMode === true) {
					for (i = 0; i <= 0x33; i++) {if (i === 0x03 || i === 0x04) continue; midi.sendShortMsg(0x95, i, 0x00);}
					CMDDC.LoadMode = false;
					CMDDC.padLigtsUpdate();
					CMDDC.tmp1 = false;
				} else {
					CMDDC.LoadMode = true;
					for (i = 0; i <= 0x33; i++) {if (i === 0x03 || i === 0x04) continue; midi.sendShortMsg(0x95, i, 0x01);}
				}
			};
		break;
		
		case 0x24: CMDDC.pad (0,  value); break;
		case 0x25: CMDDC.pad (1,  value); break;
		case 0x26: CMDDC.pad (2,  value); break;
		case 0x27: CMDDC.pad (3,  value); break;
		case 0x28: CMDDC.pad (4,  value); break;
		case 0x29: CMDDC.pad (5,  value); break;
		case 0x2a: CMDDC.pad (6,  value); break;
		case 0x2b: CMDDC.pad (7,  value); break;
		case 0x2c: CMDDC.pad (8,  value); break;
		case 0x2d: CMDDC.pad (9,  value); break;
		case 0x2e: CMDDC.pad (10, value); break;
		case 0x2f: CMDDC.pad (11, value); break;
		case 0x30: CMDDC.pad (12, value); break;
		case 0x31: CMDDC.pad (13, value); break;
		case 0x32: CMDDC.pad (14, value); break;
		case 0x33: CMDDC.pad (15, value); break;
		

		
		case 0x10: 
			if (value == 127) {
				if (CMDDC.LoadMode) break; 
				CMDDC.shift1 = true;
				midi.sendShortMsg(0x95, 0x10, 0x01);
				for (i = 36, a = 0; i < (36 + 16); i++, a++) {
					
					if (CMDDC.memoOne[a] == 1) {
							midi.sendShortMsg(0x95, i, 0x01);
							print("ok");
						} else midi.sendShortMsg(0x95, i, 0x00);
				}
			}

			if (value == 0) {
				if (CMDDC.LoadMode) break; 
				CMDDC.shift1 = false;
				midi.sendShortMsg(0x95, 0x10, 0x00);
				CMDDC.padLigtsUpdate();
			};
			break;
		
		case 0x11:
			if (value == 127) {
				if (CMDDC.LoadMode) break; 
				CMDDC.shift3 = true;
				midi.sendShortMsg(0x95, 0x11, 0x01);
				for (i = 36, a = 0; i < (36 + 16); i++, a++) {
					
					if (CMDDC.memoThree[a] == 1) {
							midi.sendShortMsg(0x95, i, 0x01);
							print("ok");
						} else midi.sendShortMsg(0x95, i, 0x00);
				}
			}

			if (value == 0) {
				if (CMDDC.LoadMode) break; 
				CMDDC.shift3 = false;
				midi.sendShortMsg(0x95, 0x11, 0x00);
				CMDDC.padLigtsUpdate();
			}
			break;
			
		case 0x12:
			if (value == 127) {
				if (CMDDC.LoadMode) {for (i = 1; i < 64; i++) {engine.setValue('[Sampler' + i + ']','eject', 1)}; break;}
				CMDDC.shift2 = true;
				midi.sendShortMsg(0x95, 0x12, 0x01);
				for (i = 36, a = 0; i < (36 + 16); i++, a++) {
					
					if (CMDDC.memoTwo[a] == 1) {
							midi.sendShortMsg(0x95, i, 0x01);
							print("ok");
						} else midi.sendShortMsg(0x95, i, 0x00);
				}
			}

			if (value == 0) {
				if (CMDDC.LoadMode) {for (i = 1; i < 64; i++) {engine.setValue('[Sampler' + i + ']','eject', 0)}; break;}
				CMDDC.shift2 = false;
				midi.sendShortMsg(0x95, 0x12, 0x00);
				CMDDC.padLigtsUpdate();
			}
			break;
			
		case 0x13:
			if (value == 127) {
				if (CMDDC.LoadMode) break; 
				CMDDC.shift4 = true;
				midi.sendShortMsg(0x95, 0x13, 0x01);
				for (i = 36, a = 0; i < (36 + 16); i++, a++) {
					
					if (CMDDC.memoFour[a] == 1) {
							midi.sendShortMsg(0x95, i, 0x01);
							print("ok");
						} else midi.sendShortMsg(0x95, i, 0x00);
				}

			}

			if (value == 0) {
				if (CMDDC.LoadMode) break; 
				CMDDC.shift4 = false;
				CMDDC.padLigtsUpdate();
				midi.sendShortMsg(0x95, 0x13, 0x00);
			}
			break;
			
		case 0x14:
			if (value == 127) {
				if (CMDDC.LoadMode) break; 
				CMDDC.shift5 = true;
				midi.sendShortMsg(0x95, 0x14, 0x01);

			}

			if (value == 0) {
				if (CMDDC.LoadMode) break; 
				CMDDC.shift5 = false;
				midi.sendShortMsg(0x95, 0x14, 0x00);

			}
			break;
			
		case 0x15:
			if (value == 127) {
				if (CMDDC.LoadMode) break; 
				//CMDDC.shift6 = true;
				midi.sendShortMsg(0x95, 0x15, 0x01);
				//engine.setValue('[Sampler'+CMDDC.whatPlay+']', 'cue_default', 0);
				engine.setValue('[Sampler'+CMDDC.whatPlay+']', 'stop', 1);
				print("you are here");
			}

			if (value == 0) {
				if (CMDDC.LoadMode) break; 
				midi.sendShortMsg(0x95, 0x15, 0x00);

			}
			break;
			
		case 0x16:
			if (value == 127) {
				if (CMDDC.LoadMode) break; 
				CMDDC.orientation = true;
				midi.sendShortMsg(0x95, 0x16, 0x01);
				for (i = 36, a = 0; i < (36 + 16); i++, a++) {
					
					if (CMDDC.memoSeven[a] == 1) {
							midi.sendShortMsg(0x95, i, 0x00);
							print("ok");
						} else midi.sendShortMsg(0x95, i, 0x01);
				}

			}

			if (value == 0) {
				if (CMDDC.LoadMode) break; 
				CMDDC.orientation = false;
				CMDDC.padLigtsUpdate();
				midi.sendShortMsg(0x95, 0x16, 0x00);
			}
			break;
			
		case 0x17:
			if (value == 127) {
				if (CMDDC.LoadMode) break; 
				if (CMDDC.tmp1) {
					CMDDC.tmp1 = false;
					midi.sendShortMsg(0x95, 0x17, 0x00);

				} else {
					CMDDC.tmp1 = true;
					midi.sendShortMsg(0x95, 0x17, 0x01);
				}
			}
			break;
	}
}


CMDDC.rotary = function(channel, control, value, status, group) {
	print("fn.rotary");
	
	switch (control) {
		case 0x10: CMDDC.volume(1, value); break;
		case 0x11: CMDDC.volume(2, value); break;
		case 0x12: CMDDC.volume(3, value); break;
		case 0x13: CMDDC.volume(4, value); break;
		case 0x14: CMDDC.volume(5, value); break;
		case 0x15: CMDDC.volume(6, value); break;
		case 0x16: CMDDC.volume(7, value); break;
		case 0x17: CMDDC.volume(8, value); break;
		
		case 0x20: 
			if (value == 0x41) {
				engine.setValue('[Playlist]', 'SelectNextTrack', 1);
				return;
			}
			if (value == 0x3F) {
				engine.setValue('[Playlist]', 'SelectPrevTrack', 1);
				return;
			}
			break;
	}
	
	
}

CMDDC.pad = function(num, value) {
if (value == 127) {
		if (CMDDC.shift1 == true) { // oneshot
			if (CMDDC.memoOne[num] == 0) {
				CMDDC.memoOne[num] = 1;
				midi.sendShortMsg(0x95, ( 36 + num), 0x01);
				return;
			}
			if (CMDDC.memoOne[num] == 1) {
				CMDDC.memoOne[num] = 0;
				midi.sendShortMsg(0x95, ( 36 + num), 0x00);
				return;
			}
			
		}
		if (CMDDC.shift2 == true) { // sync
			if (CMDDC.memoTwo[num] == 0) {
				CMDDC.memoTwo[num] = 1;
				engine.setValue('[Sampler' + (num + 1) + ']', 'sync_enabled', 1);
				midi.sendShortMsg(0x95, ( 36 + num), 0x01);
				return;
			}
			if (CMDDC.memoTwo[num] == 1) {
				CMDDC.memoTwo[num] = 0;
				engine.setValue('[Sampler' + (num + 1) + ']', 'sync_enabled', 0);
				engine.setValue('[Sampler' + (num + 1) + ']', 'rate', 0);
				midi.sendShortMsg(0x95, ( 36 + num), 0x00);
				return;
			}
			
		}
		if (CMDDC.shift3 == true) {
			if (CMDDC.memoThree[num] == 0) {
				CMDDC.memoThree[num] = 1;
				engine.setValue('[Sampler' + (num + 1) + ']', 'repeat', 1);
				midi.sendShortMsg(0x95, ( 36 + num), 0x01);
				return;
			}
			if (CMDDC.memoThree[num] == 1) {
				CMDDC.memoThree[num] = 0;
				engine.setValue('[Sampler' + (num + 1) + ']', 'repeat', 0);
				midi.sendShortMsg(0x95, ( 36 + num), 0x00);
				return;
			}
			
		}
		if (CMDDC.shift4 == true) {
			if (CMDDC.memoFour[num] == 0) {
				CMDDC.memoFour[num] = 1;
				engine.setValue('[Sampler' + (num + 1) + ']', 'pfl', 1);
				midi.sendShortMsg(0x95, ( 36 + num), 0x01);
				return;
			}
			if (CMDDC.memoFour[num] == 1) {
				CMDDC.memoFour[num] = 0;
				engine.setValue('[Sampler' + (num + 1) + ']', 'pfl', 0);
				midi.sendShortMsg(0x95, ( 36 + num), 0x00);
				return;
			}
			
		}
		if (CMDDC.orientation == true) {
			if (CMDDC.memoSeven[num] == 0) {
				CMDDC.memoSeven[num] = 1;
				engine.setValue('[Sampler' + (num + 1) + ']', 'orientation', 1);
				midi.sendShortMsg(0x95, ( 36 + num), 0x00);
				return;
			}
			if (CMDDC.memoSeven[num] == 1) {
				CMDDC.memoSeven[num] = 2;
				engine.setValue('[Sampler' + (num + 1) + ']', 'orientation', 2);
				midi.sendShortMsg(0x95, ( 36 + num), 0x01);
				return;
			}
			if (CMDDC.memoSeven[num] == 2) {
				CMDDC.memoSeven[num] = 0;
				engine.setValue('[Sampler' + (num + 1) + ']', 'orientation', 0);
				midi.sendShortMsg(0x95, ( 36 + num), 0x02);
				return;
			}
			
		}
		if (CMDDC.shift5 == true) {
			engine.setValue('[Sampler' + (num + 1) + ']', 'stop', 1);
			return;
		}
		
		if (CMDDC.LoadMode == true) {
			engine.setValue('[Sampler' + (num + 1) + ']', 'LoadSelectedTrack', 1);
			return;
		}
		
		// Unfinished
		if (CMDDC.shift6 == true) {
			engine.setValue('[Sampler' + (num + 1) + ']', 'play', 1);
			return;
		}
		
		if (CMDDC.tmp1 === true) {
			switch (num) {
				case 0:  CMDDC.plyRow(0, [1, 2, 3, 4]); break;
				case 4:  CMDDC.plyRow(1, [5, 6, 7, 8]); break;
				case 8:  CMDDC.plyRow(2, [9, 10, 11, 12]); break;
				case 12: CMDDC.plyRow(3, [13, 14, 15, 16]); break;
				case 1: CMDDC.plyRow(4, [2, 6, 10, 14]); break;
				case 2: CMDDC.plyRow(5, [3, 7, 11, 15]); break;
				case 3: CMDDC.plyRow(6, [4, 8, 12, 16]); break;
			}
			
			return;
		}
	}
		

	if (CMDDC.memoOne[num] == 1) { // Shifted
		if (value == 127) {
			engine.setValue('[Sampler' + (num + 1) + ']', 'cue_default', 1);
			CMDDC.memoFive[num] = 1;
			
			CMDDC.whatPlay = (num + 1);
			//print("");
		}
		if (value == 0) {
			engine.setValue('[Sampler' + (num + 1) + ']', 'cue_default', 0);
			if (engine.getValue('[Sampler' + (num + 1) + ']', 'play') !== 1) {
				engine.setValue('[Sampler' + (num + 1) + ']', 'cue_gotoandstop', 1);
				
			}
			CMDDC.whatPlay = null;
			CMDDC.memoFive[num] = 0;
			//print("");
		}
	}
	if (CMDDC.memoOne[num] == 0) { // Not shifted
		//print("");
		if (value == 127) {
			if (engine.getValue('[Sampler' + (num + 1) + ']', 'repeat') === 1 &&
			    engine.getValue('[Sampler' + (num + 1) + ']', 'play') === 1) {
				engine.setValue('[Sampler' + (num + 1) + ']', 'cue_gotoandstop', 1);
				return;
			}
			if (engine.getValue('[Sampler' + (num + 1) + ']', 'play') === 1) {
				engine.setValue('[Sampler' + (num + 1) + ']', 'cue_gotoandstop', 1);
				return;
			}
			engine.setValue('[Sampler' + (num + 1) + ']', 'cue_gotoandplay', 1);
		}
		if (value == 0) {
			
		}
		
	}
}

CMDDC.plyRow = function (num, a) {
			if (CMDDC.playRow[num]) {
				CMDDC.playRow[num] = false;
				if (engine.getValue('[Sampler' + a[0] + ']', 'play') === 1) {
					engine.setValue('[Sampler' + a[0] + ']', 'start_stop', 1);
				} else {
					engine.setValue('[Sampler' + a[0] + ']', 'start_play', 1);
					
				}
				if (engine.getValue('[Sampler' + a[1] + ']', 'play') === 1) {
					engine.setValue('[Sampler' + a[1] + ']', 'start_stop', 1);
				} else {
					engine.setValue('[Sampler' + a[1] + ']', 'start_play', 1);
				}
				if (engine.getValue('[Sampler' + a[2] + ']', 'play') === 1) {
					engine.setValue('[Sampler' + a[2] + ']', 'start_stop', 1);
				} else {
					engine.setValue('[Sampler' + a[2] + ']', 'start_play', 1);
				}
				if (engine.getValue('[Sampler' + a[3] + ']', 'play') === 1) {
					engine.setValue('[Sampler' + a[3] + ']', 'start_stop', 1);
				} else {
					engine.setValue('[Sampler' + a[3] + ']', 'start_play', 1);
				}
				
				if (
					engine.getValue('[Sampler' + a[0] + ']', 'play') === 1 &&
					engine.getValue('[Sampler' + a[1] + ']', 'play') === 1 &&
					engine.getValue('[Sampler' + a[2] + ']', 'play') === 1 &&
					engine.getValue('[Sampler' + a[3] + ']', 'play') === 1
				) CMDDC.playRow[num] = true;
			} else {
				CMDDC.playRow[num] = true;
				
				engine.setValue('[Sampler' + a[0] + ']', 'start_play', 1);
				engine.setValue('[Sampler' + a[1] + ']', 'start_play', 1);
				engine.setValue('[Sampler' + a[2] + ']', 'start_play', 1);
				engine.setValue('[Sampler' + a[3] + ']', 'start_play', 1);
			}
}

CMDDC.volume = function (num, value) {
	if (CMDDC.tmp1 == true) {
		if (value == 0x41) {
			var gain = engine.getValue('[Sampler' + (num + 8) + ']', 'pregain') * 100;
			gain = (gain + 5) / 100
			engine.setValue('[Sampler' + (num + 8) + ']', 'pregain', gain);
			CMDDC.chVolumeLed(num, value);
			return;
		}
		if (value == 0x3F) {
			var gain = engine.getValue('[Sampler' + (num + 8) + ']', 'pregain') * 100;
			gain = (gain - 5) / 100;
			engine.setValue('[Sampler' + (num + 8) + ']', 'pregain', gain);
			CMDDC.chVolumeLed(num, value);
			return;
		}
	}

	if (value == 0x41) {
		var gain = engine.getValue('[Sampler' + num + ']', 'pregain') * 100;
		gain = (gain + 5) / 100
		engine.setValue('[Sampler' + num + ']', 'pregain', gain);
		
		CMDDC.chVolumeLed(num, value);
		
		return;
	}
	if (value == 0x3F) {
		var gain = engine.getValue('[Sampler' + num + ']', 'pregain') * 100;
		gain = (gain - 5) / 100;
		engine.setValue('[Sampler' + num + ']', 'pregain', gain);
		
		CMDDC.chVolumeLed(num, value);
		
		return;
	}
}

CMDDC.shutdown = function() { for (i = 0; i < 0x35; i++) {midi.sendShortMsg(0x95, i, 0x00); midi.sendShortMsg(0xB5, i, 0x00)} }