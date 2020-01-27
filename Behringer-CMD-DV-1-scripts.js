var CMDDV = new Object();

CMDDV.init = function () {
	CMDDV.ch = ['[Channel3]', '[Channel1]', '[Channel2]', '[Channel4]']; // Channel order
	
	CMDDV.cch = '[Channel1]'; // Focus Channel
	
	CMDDV.erase = 0;
	
	//midi.sendShortMsg(0x90, 0x40, 0x01);
	
	CMDDV.shift1 = false;
	CMDDV.shift2 = false;
	CMDDV.shift3 = false;
	CMDDV.shift4 = false;
	
	CMDDV.fx1act = 0;
	CMDDV.fx2act = 0;
	CMDDV.fx3act = 0;
	CMDDV.fx4act = 0;
	
	CMDDV.fx1effect = 1; // 1 - 2 -3
	CMDDV.fx2effect = 1; // 1 - 2 -3
	CMDDV.fx3effect = 1; // 1 - 2 -3
	CMDDV.fx4effect = 1; // 1 - 2 -3
	
	midi.sendShortMsg(0x90, 0x25, 0x01);
	midi.sendShortMsg(0x90, 0x29, 0x01);
	midi.sendShortMsg(0x90, 0x2D, 0x01);
	midi.sendShortMsg(0x90, 0x31, 0x01);
	
	
	CMDDV.fx1on = engine.getValue('[EffectRack1_EffectUnit1_Effect1]', 'enabled');
	CMDDV.fx2on = engine.getValue('[EffectRack1_EffectUnit1_Effect2]', 'enabled');
	CMDDV.fx3on = engine.getValue('[EffectRack1_EffectUnit1_Effect3]', 'enabled');
	CMDDV.fx4on = engine.getValue('[EffectRack1_EffectUnit2_Effect1]', 'enabled');
	CMDDV.fx5on = engine.getValue('[EffectRack1_EffectUnit2_Effect2]', 'enabled');
	CMDDV.fx6on = engine.getValue('[EffectRack1_EffectUnit2_Effect3]', 'enabled');
	CMDDV.fx7on = engine.getValue('[EffectRack1_EffectUnit3_Effect1]', 'enabled');
	CMDDV.fx8on = engine.getValue('[EffectRack1_EffectUnit3_Effect2]', 'enabled');
	CMDDV.fx9on = engine.getValue('[EffectRack1_EffectUnit3_Effect3]', 'enabled');
	CMDDV.fx10on = engine.getValue('[EffectRack1_EffectUnit4_Effect1]', 'enabled');
	CMDDV.fx11on = engine.getValue('[EffectRack1_EffectUnit4_Effect2]', 'enabled');
	CMDDV.fx12on = engine.getValue('[EffectRack1_EffectUnit4_Effect3]', 'enabled');
	
	CMDDV.ch0fx =  [engine.getValue('[EffectRack1_EffectUnit1]', 'group_'+CMDDV.ch[0]+'_enable'),
					engine.getValue('[EffectRack1_EffectUnit1]', 'group_'+CMDDV.ch[1]+'_enable'),
					engine.getValue('[EffectRack1_EffectUnit1]', 'group_'+CMDDV.ch[2]+'_enable'),
					engine.getValue('[EffectRack1_EffectUnit1]', 'group_'+CMDDV.ch[3]+'_enable')];
	CMDDV.ch1fx =  [engine.getValue('[EffectRack1_EffectUnit2]', 'group_'+CMDDV.ch[0]+'_enable'),
					engine.getValue('[EffectRack1_EffectUnit2]', 'group_'+CMDDV.ch[1]+'_enable'),
					engine.getValue('[EffectRack1_EffectUnit2]', 'group_'+CMDDV.ch[2]+'_enable'),
					engine.getValue('[EffectRack1_EffectUnit2]', 'group_'+CMDDV.ch[3]+'_enable')];
	CMDDV.ch2fx =  [engine.getValue('[EffectRack1_EffectUnit3]', 'group_'+CMDDV.ch[0]+'_enable'),
					engine.getValue('[EffectRack1_EffectUnit3]', 'group_'+CMDDV.ch[1]+'_enable'),
					engine.getValue('[EffectRack1_EffectUnit3]', 'group_'+CMDDV.ch[2]+'_enable'),
					engine.getValue('[EffectRack1_EffectUnit3]', 'group_'+CMDDV.ch[3]+'_enable')];
	CMDDV.ch3fx =  [engine.getValue('[EffectRack1_EffectUnit4]', 'group_'+CMDDV.ch[0]+'_enable'),
					engine.getValue('[EffectRack1_EffectUnit4]', 'group_'+CMDDV.ch[1]+'_enable'),
					engine.getValue('[EffectRack1_EffectUnit4]', 'group_'+CMDDV.ch[2]+'_enable'),
					engine.getValue('[EffectRack1_EffectUnit4]', 'group_'+CMDDV.ch[3]+'_enable')];
	

	engine.makeConnection('[EffectRack1_EffectUnit1_Effect1]', 'enabled',  function(value) {midi.sendShortMsg(0x90, 0x15, value)});
	engine.makeConnection('[EffectRack1_EffectUnit1_Effect2]', 'enabled',  function(value) {midi.sendShortMsg(0x90, 0x16, value)});
	engine.makeConnection('[EffectRack1_EffectUnit1_Effect3]', 'enabled',  function(value) {midi.sendShortMsg(0x90, 0x17, value)});
	engine.makeConnection('[EffectRack1_EffectUnit2_Effect1]', 'enabled',  function(value) {midi.sendShortMsg(0x90, 0x19, value)});
	engine.makeConnection('[EffectRack1_EffectUnit2_Effect2]', 'enabled',  function(value) {midi.sendShortMsg(0x90, 0x1A, value)});
	engine.makeConnection('[EffectRack1_EffectUnit2_Effect3]', 'enabled',  function(value) {midi.sendShortMsg(0x90, 0x1B, value)});
	engine.makeConnection('[EffectRack1_EffectUnit3_Effect1]', 'enabled',  function(value) {midi.sendShortMsg(0x90, 0x1D, value)});
	engine.makeConnection('[EffectRack1_EffectUnit3_Effect2]', 'enabled',  function(value) {midi.sendShortMsg(0x90, 0x1E, value)});
	engine.makeConnection('[EffectRack1_EffectUnit3_Effect3]', 'enabled',  function(value) {midi.sendShortMsg(0x90, 0x1F, value)});
	engine.makeConnection('[EffectRack1_EffectUnit4_Effect1]', 'enabled',  function(value) {midi.sendShortMsg(0x90, 0x21, value)});
	engine.makeConnection('[EffectRack1_EffectUnit4_Effect2]', 'enabled',  function(value) {midi.sendShortMsg(0x90, 0x22, value)});
	engine.makeConnection('[EffectRack1_EffectUnit4_Effect3]', 'enabled',  function(value) {midi.sendShortMsg(0x90, 0x23, value)});
};



CMDDV.button = function (channel, control, value, status, group) {
	if (value === 127) {
		switch (control) {
			case 0x14: 
				    CMDDV.shift1 = true;
					midi.sendShortMsg(0x90, 0x14, 0x01);
				break;
			case 0x15: 
				if (CMDDV.fx1on === 1) {
					CMDDV.fx1on = 0;
					engine.setValue('[EffectRack1_EffectUnit1_Effect1]', 'enabled', 0);
				} else {
					CMDDV.fx1on = 1;
					engine.setValue('[EffectRack1_EffectUnit1_Effect1]', 'enabled', 1);
				}
				break;
			case 0x16: 
			
				if (CMDDV.fx2on === 1) {
					CMDDV.fx2on = 0;
					engine.setValue('[EffectRack1_EffectUnit1_Effect2]', 'enabled', 0);
				} else {
					CMDDV.fx2on = 1;
					engine.setValue('[EffectRack1_EffectUnit1_Effect2]', 'enabled', 1);
				}
				break;
			case 0x17: 
			
				if (CMDDV.fx3on === 1) {
					CMDDV.fx3on = 0;
					engine.setValue('[EffectRack1_EffectUnit1_Effect3]', 'enabled', 0);
				} else {
					CMDDV.fx3on = 1;
					engine.setValue('[EffectRack1_EffectUnit1_Effect3]', 'enabled', 1);
				}
				break;
			case 0x18: 
				CMDDV.shift2 = true;
				midi.sendShortMsg(0x90, 0x18, 0x01);
				break;
			case 0x19: 
				if (CMDDV.fx4on === 1) {
					CMDDV.fx4on = 0;
					engine.setValue('[EffectRack1_EffectUnit2_Effect1]', 'enabled', 0);
				} else {
					CMDDV.fx4on = 1;
					engine.setValue('[EffectRack1_EffectUnit2_Effect1]', 'enabled', 1);
				}
				break; 
			case 0x1A: 
			
				if (CMDDV.fx5on === 1) {
					CMDDV.fx5on = 0;
					engine.setValue('[EffectRack1_EffectUnit2_Effect2]', 'enabled', 0);
				} else {
					CMDDV.fx5on = 1;
					engine.setValue('[EffectRack1_EffectUnit2_Effect2]', 'enabled', 1);
				}
				break;
			case 0x1B: 
			
				if (CMDDV.fx6on === 1) {
					CMDDV.fx6on = 0;
					engine.setValue('[EffectRack1_EffectUnit2_Effect3]', 'enabled', 0);
				} else {
					CMDDV.fx6on = 1;
					engine.setValue('[EffectRack1_EffectUnit2_Effect3]', 'enabled', 1);
				}
				break;
			case 0x1C: 
				CMDDV.shift3 = true;
				midi.sendShortMsg(0x90, 0x1C, 0x01);
				break;
			case 0x1D: 
				if (CMDDV.fx7on === 1) {
					CMDDV.fx7on = 0;
					engine.setValue('[EffectRack1_EffectUnit3_Effect1]', 'enabled', 0);
				} else {
					CMDDV.fx7on = 1;
					engine.setValue('[EffectRack1_EffectUnit3_Effect1]', 'enabled', 1);
				}
				break;
			case 0x1E: 
			
				if (CMDDV.fx8on === 1) {
					CMDDV.fx8on = 0;
					engine.setValue('[EffectRack1_EffectUnit3_Effect2]', 'enabled', 0);
				} else {
					CMDDV.fx8on = 1;
					engine.setValue('[EffectRack1_EffectUnit3_Effect2]', 'enabled', 1);
				}
				break;
			case 0x1F: 
			
				if (CMDDV.fx9on === 1) {
					CMDDV.fx9on = 0;
					engine.setValue('[EffectRack1_EffectUnit3_Effect3]', 'enabled', 0);
				} else {
					CMDDV.fx9on = 1;
					engine.setValue('[EffectRack1_EffectUnit3_Effect3]', 'enabled', 1);
				}
				break;
			case 0x20: 
				CMDDV.shift4 = true;
				midi.sendShortMsg(0x90, 0x20, 0x01);
				break;
			case 0x21: 
				if (CMDDV.fx10on === 1) {
					CMDDV.fx10on = 0;
					engine.setValue('[EffectRack1_EffectUnit4_Effect1]', 'enabled', 0);
				} else {
					CMDDV.fx10on = 1;
					engine.setValue('[EffectRack1_EffectUnit4_Effect1]', 'enabled', 1);
				}
				break;
			case 0x22: 
			
				if (CMDDV.fx11on === 1) {
					CMDDV.fx11on = 0;
					engine.setValue('[EffectRack1_EffectUnit4_Effect2]', 'enabled', 0);
				} else {
					CMDDV.fx11on = 1;
					engine.setValue('[EffectRack1_EffectUnit4_Effect2]', 'enabled', 1);
				}
				break;
			case 0x23: 
			
				if (CMDDV.fx12on === 1) {
					CMDDV.fx12on = 0;
					engine.setValue('[EffectRack1_EffectUnit4_Effect3]', 'enabled', 0);
				} else {
					CMDDV.fx12on = 1;
					engine.setValue('[EffectRack1_EffectUnit4_Effect3]', 'enabled', 1);
				}
				break;
				
				
			// FX 1	
			case 0x24: break;
			case 0x25: CMDDV.fx1effect = 1; midi.sendShortMsg(0x90, 0x25, 0x01); midi.sendShortMsg(0x90, 0x26, 0x00); midi.sendShortMsg(0x90, 0x27, 0x00); break;
			case 0x26: CMDDV.fx1effect = 2; midi.sendShortMsg(0x90, 0x25, 0x00); midi.sendShortMsg(0x90, 0x26, 0x01); midi.sendShortMsg(0x90, 0x27, 0x00); break;
			case 0x27: CMDDV.fx1effect = 3; midi.sendShortMsg(0x90, 0x25, 0x00); midi.sendShortMsg(0x90, 0x26, 0x00); midi.sendShortMsg(0x90, 0x27, 0x01); break;
			
			// FX 2	
			case 0x28: break;
			case 0x29: CMDDV.fx2effect = 1; midi.sendShortMsg(0x90, 0x29, 0x01); midi.sendShortMsg(0x90, 0x2A, 0x00); midi.sendShortMsg(0x90, 0x2B, 0x00); break;
			case 0x2A: CMDDV.fx2effect = 2; midi.sendShortMsg(0x90, 0x29, 0x00); midi.sendShortMsg(0x90, 0x2A, 0x01); midi.sendShortMsg(0x90, 0x2B, 0x00); break;
			case 0x2B: CMDDV.fx2effect = 3; midi.sendShortMsg(0x90, 0x29, 0x00); midi.sendShortMsg(0x90, 0x2A, 0x00); midi.sendShortMsg(0x90, 0x2B, 0x01); break;
			
			// FX 3	
			case 0x2C: break;
			case 0x2D: CMDDV.fx3effect = 1; midi.sendShortMsg(0x90, 0x2D, 0x01); midi.sendShortMsg(0x90, 0x2E, 0x00); midi.sendShortMsg(0x90, 0x2F, 0x00); break;
			case 0x2E: CMDDV.fx3effect = 2; midi.sendShortMsg(0x90, 0x2D, 0x00); midi.sendShortMsg(0x90, 0x2E, 0x01); midi.sendShortMsg(0x90, 0x2F, 0x00); break;
			case 0x2F: CMDDV.fx3effect = 3; midi.sendShortMsg(0x90, 0x2D, 0x00); midi.sendShortMsg(0x90, 0x2E, 0x00); midi.sendShortMsg(0x90, 0x2F, 0x01); break;
			
			// FX 4
			case 0x30: break;
			case 0x31: CMDDV.fx4effect = 1; midi.sendShortMsg(0x90, 0x31, 0x01); midi.sendShortMsg(0x90, 0x32, 0x00); midi.sendShortMsg(0x90, 0x33, 0x00); break;
			case 0x32: CMDDV.fx4effect = 2; midi.sendShortMsg(0x90, 0x31, 0x00); midi.sendShortMsg(0x90, 0x32, 0x01); midi.sendShortMsg(0x90, 0x33, 0x00); break;
			case 0x33: CMDDV.fx4effect = 3; midi.sendShortMsg(0x90, 0x31, 0x00); midi.sendShortMsg(0x90, 0x32, 0x00); midi.sendShortMsg(0x90, 0x33, 0x01); break;
				
			case 0x44: CMDDV.crossfade(); break;
			case 0x45: CMDDV.cut();       break;
			case 0x46:
			case 0x47:
				
				
				break;
			
			//case 0x40: CMDDV.cch = CMDDV.ch[0]; midi.sendShortMsg(0x90, 0x40, 0x01); midi.sendShortMsg(0x90, 0x41, 0x00); midi.sendShortMsg(0x90, 0x42, 0x00); midi.sendShortMsg(0x90, 0x43, 0x00); break;
			//case 0x41: CMDDV.cch = CMDDV.ch[1]; midi.sendShortMsg(0x90, 0x41, 0x01); midi.sendShortMsg(0x90, 0x42, 0x00); midi.sendShortMsg(0x90, 0x43, 0x00); midi.sendShortMsg(0x90, 0x40, 0x00);break;
			//case 0x42: CMDDV.cch = CMDDV.ch[2]; midi.sendShortMsg(0x90, 0x42, 0x01); midi.sendShortMsg(0x90, 0x43, 0x00); midi.sendShortMsg(0x90, 0x40, 0x00); midi.sendShortMsg(0x90, 0x41, 0x00);break;
			//case 0x43: CMDDV.cch = CMDDV.ch[3]; midi.sendShortMsg(0x90, 0x43, 0x01); midi.sendShortMsg(0x90, 0x40, 0x00); midi.sendShortMsg(0x90, 0x41, 0x00); midi.sendShortMsg(0x90, 0x42, 0x00);break;
			//
			//case 0x55: CMDDV.erase = true; midi.sendShortMsg(0x90, 0x55, 0x01); break;
			//
			//case 0x5C: if (!CMDDV.erase) {engine.setValue(CMDDV.cch, 'hotcue_1_activate', 1);} else {engine.setValue(CMDDV.cch, 'hotcue_1_clear', 1);} break;
			//case 0x5D: if (!CMDDV.erase) {engine.setValue(CMDDV.cch, 'hotcue_2_activate', 1);} else {engine.setValue(CMDDV.cch, 'hotcue_2_clear', 1);} break;
			//case 0x5E: if (!CMDDV.erase) {engine.setValue(CMDDV.cch, 'hotcue_3_activate', 1);} else {engine.setValue(CMDDV.cch, 'hotcue_3_clear', 1);} break;
			//case 0x5F: if (!CMDDV.erase) {engine.setValue(CMDDV.cch, 'hotcue_4_activate', 1);} else {engine.setValue(CMDDV.cch, 'hotcue_4_clear', 1);} break;
			//case 0x58: if (!CMDDV.erase) {engine.setValue(CMDDV.cch, 'hotcue_5_activate', 1);} else {engine.setValue(CMDDV.cch, 'hotcue_5_clear', 1);} break;
			//case 0x59: if (!CMDDV.erase) {engine.setValue(CMDDV.cch, 'hotcue_6_activate', 1);} else {engine.setValue(CMDDV.cch, 'hotcue_6_clear', 1);} break;
			//case 0x5A: if (!CMDDV.erase) {engine.setValue(CMDDV.cch, 'hotcue_7_activate', 1);} else {engine.setValue(CMDDV.cch, 'hotcue_7_clear', 1);} break;
			//case 0x5B: if (!CMDDV.erase) {engine.setValue(CMDDV.cch, 'hotcue_8_activate', 1);} else {engine.setValue(CMDDV.cch, 'hotcue_8_clear', 1);} break;
			
		}
	}

	if (value === 0) {
		switch (control) {
			case 0x14: 
				CMDDV.shift1 = false;
				midi.sendShortMsg(0x90, 0x14, 0x00); 
			break;
			case 0x18: 
				CMDDV.shift2 = false;
				midi.sendShortMsg(0x90, 0x18, 0x00); 
			break;
			case 0x1C: 
				CMDDV.shift3 = false;
				midi.sendShortMsg(0x90, 0x1C, 0x00); 
			break;
			case 0x20: 
				CMDDV.shift4 = false;
				midi.sendShortMsg(0x90, 0x20, 0x00); 
			break;
			
			
			case 0x24: 

				break;
			case 0x28: 

				break;
			case 0x2C: 

				break;
			case 0x30: 

				break;
				
			case 0x55: CMDDV.erase = false; midi.sendShortMsg(0x90, 0x55, 0x00); break;
			
		}
		return;
	}
}

CMDDV.rotary = function (channel, control, value, status, group) {
	switch (control) {
		case 0x14: if (CMDDV.shift1) CMDDV.FX('[EffectRack1_EffectUnit1]', 'mix', value); else CMDDV.FX('[EffectRack1_EffectUnit1]', 'super1', value); break;
		case 0x15: if (CMDDV.shift1) CMDDV.chFX('[EffectRack1_EffectUnit1_Effect1]', 'effect_selector', value); else CMDDV.FX('[EffectRack1_EffectUnit1_Effect1]', 'meta', value); break;
		case 0x16: if (CMDDV.shift1) CMDDV.chFX('[EffectRack1_EffectUnit1_Effect2]', 'effect_selector', value); else CMDDV.FX('[EffectRack1_EffectUnit1_Effect2]', 'meta', value); break;
		case 0x17: if (CMDDV.shift1) CMDDV.chFX('[EffectRack1_EffectUnit1_Effect3]', 'effect_selector', value); else CMDDV.FX('[EffectRack1_EffectUnit1_Effect3]', 'meta', value); break;
		
		case 0x18: if (CMDDV.shift2) CMDDV.FX('[EffectRack1_EffectUnit2]', 'mix', value); else CMDDV.FX('[EffectRack1_EffectUnit2]', 'super1', value); break;
		case 0x19: if (CMDDV.shift2) CMDDV.chFX('[EffectRack1_EffectUnit2_Effect1]', 'effect_selector', value); else CMDDV.FX('[EffectRack1_EffectUnit2_Effect1]', 'meta', value); break;
		case 0x1A: if (CMDDV.shift2) CMDDV.chFX('[EffectRack1_EffectUnit2_Effect2]', 'effect_selector', value); else CMDDV.FX('[EffectRack1_EffectUnit2_Effect2]', 'meta', value); break;
		case 0x1B: if (CMDDV.shift2) CMDDV.chFX('[EffectRack1_EffectUnit2_Effect3]', 'effect_selector', value); else CMDDV.FX('[EffectRack1_EffectUnit2_Effect3]', 'meta', value); break;
		
		case 0x1C: if (CMDDV.shift3) CMDDV.FX('[EffectRack1_EffectUnit3]', 'mix', value); else CMDDV.FX('[EffectRack1_EffectUnit3]', 'super1', value); break;
		case 0x1D: if (CMDDV.shift3) CMDDV.chFX('[EffectRack1_EffectUnit3_Effect1]', 'effect_selector', value); else CMDDV.FX('[EffectRack1_EffectUnit3_Effect1]', 'meta', value); break;
		case 0x1E: if (CMDDV.shift3) CMDDV.chFX('[EffectRack1_EffectUnit3_Effect2]', 'effect_selector', value); else CMDDV.FX('[EffectRack1_EffectUnit3_Effect2]', 'meta', value); break;
		case 0x1F: if (CMDDV.shift3) CMDDV.chFX('[EffectRack1_EffectUnit3_Effect3]', 'effect_selector', value); else CMDDV.FX('[EffectRack1_EffectUnit3_Effect3]', 'meta', value); break;
		
		case 0x20: if (CMDDV.shift4) CMDDV.FX('[EffectRack1_EffectUnit4]', 'mix', value); else CMDDV.FX('[EffectRack1_EffectUnit4]', 'super1', value); break;
		case 0x21: if (CMDDV.shift4) CMDDV.chFX('[EffectRack1_EffectUnit4_Effect1]', 'effect_selector', value); else CMDDV.FX('[EffectRack1_EffectUnit4_Effect1]', 'meta', value); break;
		case 0x22: if (CMDDV.shift4) CMDDV.chFX('[EffectRack1_EffectUnit4_Effect2]', 'effect_selector', value); else CMDDV.FX('[EffectRack1_EffectUnit4_Effect2]', 'meta', value); break;
		case 0x23: if (CMDDV.shift4) CMDDV.chFX('[EffectRack1_EffectUnit4_Effect3]', 'effect_selector', value); else CMDDV.FX('[EffectRack1_EffectUnit4_Effect3]', 'meta', value); break;
		
		/* PT 2 */
		
		case 0x24: CMDDV.FX('[EffectRack1_EffectUnit1_Effect'+CMDDV.fx1effect+']', 'parameter1', value); break;
		case 0x25: CMDDV.FX('[EffectRack1_EffectUnit1_Effect'+CMDDV.fx1effect+']', 'parameter2', value); break;
		case 0x26: CMDDV.FX('[EffectRack1_EffectUnit1_Effect'+CMDDV.fx1effect+']', 'parameter3', value); break;
		case 0x27: CMDDV.FX('[EffectRack1_EffectUnit1_Effect'+CMDDV.fx1effect+']', 'parameter4', value); break;
		
		case 0x28: CMDDV.FX('[EffectRack1_EffectUnit2_Effect'+CMDDV.fx2effect+']', 'parameter1', value); break;
		case 0x29: CMDDV.FX('[EffectRack1_EffectUnit2_Effect'+CMDDV.fx2effect+']', 'parameter2', value); break;
		case 0x2A: CMDDV.FX('[EffectRack1_EffectUnit2_Effect'+CMDDV.fx2effect+']', 'parameter3', value); break;
		case 0x2B: CMDDV.FX('[EffectRack1_EffectUnit2_Effect'+CMDDV.fx2effect+']', 'parameter4', value); break;
		
		case 0x2C: CMDDV.FX('[EffectRack1_EffectUnit3_Effect'+CMDDV.fx3effect+']', 'parameter1', value); break;
		case 0x2D: CMDDV.FX('[EffectRack1_EffectUnit3_Effect'+CMDDV.fx3effect+']', 'parameter2', value); break;
		case 0x2E: CMDDV.FX('[EffectRack1_EffectUnit3_Effect'+CMDDV.fx3effect+']', 'parameter3', value); break;
		case 0x2F: CMDDV.FX('[EffectRack1_EffectUnit3_Effect'+CMDDV.fx3effect+']', 'parameter4', value); break;
		
		case 0x30: CMDDV.FX('[EffectRack1_EffectUnit4_Effect'+CMDDV.fx4effect+']', 'parameter1', value); break;
		case 0x31: CMDDV.FX('[EffectRack1_EffectUnit4_Effect'+CMDDV.fx4effect+']', 'parameter2', value); break;
		case 0x32: CMDDV.FX('[EffectRack1_EffectUnit4_Effect'+CMDDV.fx4effect+']', 'parameter3', value); break;
		case 0x33: CMDDV.FX('[EffectRack1_EffectUnit4_Effect'+CMDDV.fx4effect+']', 'parameter4', value); break;
		
		case 0x40: CMDDV.FX('[EffectRack1_EffectUnit1]', 'mix', value); break;
		case 0x41: CMDDV.FX('[EffectRack1_EffectUnit2]', 'mix', value); break;
		case 0x42: CMDDV.FX('[EffectRack1_EffectUnit3]', 'mix', value); break;
		case 0x43: CMDDV.FX('[EffectRack1_EffectUnit4]', 'mix', value); break;
	}
}

CMDDV.FX = function (group, parameter, value) {

	
    var precision = 100;
    var step      = 3;
    var amount = engine.getValue(group, parameter) * precision;
    if (value === 0x41) {
        amount = (amount + step) / precision;
        engine.setValue(group, parameter, amount);
    } else if (value === 0x3f) {
        amount = (amount - step) / precision;
        engine.setValue(group, parameter, amount);
    }
}

CMDDV.chFX = function (group, parameter, value) {

    if (value === 0x41) {
        engine.setValue(group, parameter, 1);
    } else if (value === 0x3f) {
        engine.setValue(group, parameter, -1);
    }
}

CMDDV.shutdown = function () {
	for (i = 0; i <= 0x5F; i++) {
		midi.sendShortMsg(0x90, i, 0x00);
	}  
};

CMDDV.crossfade = function () {
	var value = engine.getValue('[Master]', 'crossfader');
	
	if (CMDDV.timer1) {
		engine.stopTimer(CMDDV.timer1);
		midi.sendShortMsg(0x90, 0x44, 0x00);
	}
	
	
	midi.sendShortMsg(0x90, 0x44, 0x02);
	if (value <= 0.01) {
		CMDDV.timer1 = engine.beginTimer(50, CMDDV.crossRight, false); 
	} else {
		CMDDV.timer1 = engine.beginTimer(50, CMDDV.crossLeft,  false); 
	}
}

CMDDV.crossRight = function (value) {
		cur_val = engine.getValue('[Master]', 'crossfader');
		cur_val = cur_val + 0.01;
		engine.setValue('[Master]', 'crossfader', cur_val);
		if (cur_val >= 1) {
			if (CMDDV.timer1) engine.stopTimer(CMDDV.timer1);
			midi.sendShortMsg(0x90, 0x44, 0x00);
		}
		//print('dbg');
}

CMDDV.crossLeft = function (value) {
		cur_val = engine.getValue('[Master]', 'crossfader');
		cur_val = cur_val - 0.01;
		engine.setValue('[Master]', 'crossfader', cur_val);
		if (cur_val <= -1) {
			if (CMDDV.timer1) engine.stopTimer(CMDDV.timer1);
			midi.sendShortMsg(0x90, 0x44, 0x00);
		}
		//print('dbg');
}

CMDDV.cut = function () {
	if (engine.getValue('[Master]', 'crossfader') === -1) {
		engine.setValue('[Channel2]', 'cue_gotoandplay', 1);
		engine.setValue('[Master]', 'crossfader', 1);
	} else if (engine.getValue('[Master]', 'crossfader') === 1) {
		engine.setValue('[Channel1]', 'cue_gotoandplay', 1);
		engine.setValue('[Master]', 'crossfader', -1);
	}
	
}