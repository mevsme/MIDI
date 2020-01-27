<?php 
// php dv.xml.php > "CMD_DV-1_MIDI_1.midi.xml"


echo "<?xml version='1.0' encoding='utf-8'?>"; ?>
<MixxxControllerPreset mixxxVersion="" schemaVersion="1">
    <info>
        <name>Behringer CMD DV-1</name>
        <author>STUNKIT</author>
        <description>v.15.10.2019</description>
        <wiki>https://mixxx.org/wiki/doku.php/behringer_cmd_dv-1-sp</wiki>
        <forums>https://mixxx.org/forums/viewtopic.php?f=7&amp;t=8762</forums>
    </info>
    <controller id="CMD">
        <scriptfiles>
            <file filename="Behringer-CMD-DV-1-scripts.js" functionprefix="CMDDV"/>
        </scriptfiles>
        <controls>
		<?php
		$buttons = array('0x14', '0x15', '0x16', '0x17', 
		                 '0x18', '0x19', '0x1A', '0x1B',
						 '0x1C', '0x1D', '0x1E', '0x1F',
                         '0x20', '0x21', '0x22', '0x23',
						 
                         '0x24', '0x25', '0x26', '0x27',
						 '0x28', '0x29', '0x2A', '0x2B',
						 '0x2C', '0x2D', '0x2E', '0x2F', 
						 '0x30', '0x31', '0x32', '0x33',
						 
						 '0x40', '0x41', '0x42', '0x43', // focus  - beat loops 
						 '0x44', '0x45', '0x46', '0x47', // master - FX
						 '0x48', '0x49', '0x4A', '0x4B', // double
						 
						 '0x50', '0x51', '0x52', '0x53', 
						 '0x54', '0x55', '0x56', '0x57', 
						 
						 '0x58', '0x59', '0x5A', '0x5B', // lover row CUES
						 '0x5C', '0x5D', '0x5E', '0x5F',
						 );
		$rotaries  = array('0x14', '0x15', '0x16', '0x17', 
		                   '0x18', '0x19', '0x1A', '0x1B', 
						   '0x1C', '0x1D', '0x1E', '0x1F', 
						   '0x20', '0x21', '0x22', '0x23', 
						   
						   '0x24', '0x25', '0x26', '0x27', 
						   '0x28', '0x29', '0x2A', '0x2B', 
						   '0x2C', '0x2D', '0x2E', '0x2F', 
						   '0x30', '0x31', '0x32', '0x33', 
						   
						   '0x40', '0x41', '0x42', '0x43', 
						   );
		
		
		foreach ($buttons as $key => $button) { ?>
	<control>
				<group>[]</group>
				<key>CMDDV.button</key>
				<status>0x90</status>
				<midino><?= $button; ?></midino>
				<options>
					<script-binding/>
				</options>
			</control>
			<control>
				<group>[]</group>
				<key>CMDDV.button</key>
				<status>0x80</status>
				<midino><?= $button; ?></midino>
				<options>
					<script-binding/>
				</options>
			</control>
		<?php } 
		
		foreach ($rotaries as $key => $rotary) { ?>
		<control>
					<group>[]</group>
					<key>CMDDV.rotary</key>
					<status>0xB0</status>
					<midino><?= $rotary; ?></midino>
					<options>
						<script-binding/>
					</options>
				</control>
		<?php } ?>
		
		
        
        </controls>            
    </controller>
</MixxxControllerPreset>
