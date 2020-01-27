<?php 
// php dc.xml.php > "CMD_DC-1.midi.xml"


echo "<?xml version='1.0' encoding='utf-8'?>"; ?>
<MixxxControllerPreset mixxxVersion="" schemaVersion="1">
    <info>
        <name>Behringer CMD DC-1</name>
        <author>Sound Peaks</author>
        <description>v.2019.10.23</description>
        <wiki>https://mixxx.org/wiki/doku.php/behringer_cmd_dc-1-sp</wiki>
        <forums>https://mixxx.org/forums/viewtopic.php?f=7&amp;t=8762</forums>
    </info>
	<controller id="CMDDC">
        <scriptfiles>
            <file filename="Behringer-CMD-DC-1-scripts.js" functionprefix="CMDDC"/>
        </scriptfiles>
		<controls>
		<?php

		$buttons = array('0x00', '0x01', '0x02', '0x03', '0x04', '0x05', '0x06', '0x07', '0x20', '0x10', '0x11', '0x12', '0x13', '0x14', '0x15', '0x16', '0x17', '0x24', '0x25', '0x26', '0x27', '0x28', '0x29', '0x2a', '0x2b', '0x2c', '0x2d', '0x2e', '0x2f', '0x30', '0x31', '0x32', '0x33');
		$rotaries  = array('0x10', '0x11', '0x12', '0x13', '0x14', '0x15', '0x16', '0x17', '0x20');
		
		
		foreach ($rotaries as $key => $rotary) { ?>
		<control>
					<group>[Rotary_<?= substr($rotary, 2); ?>]</group>
					<key>CMDDC.rotary</key>
					<status>0xB5</status>
					<midino><?= $rotary; ?></midino>
					<options>
						<script-binding/>
					</options>
				</control>
		<?php
		}
		
		foreach ($buttons as $key => $button) { ?>
		<control>
					<group>[Button_<?= substr($button, 2); ?>]</group>
					<key>CMDDC.button</key>
					<status>0x95</status>
					<midino><?= $button; ?></midino>
					<options>
						<script-binding/>
					</options>
				</control>
				<control>
					<group>[Button_<?= substr($button, 2); ?>]</group>
					<key>CMDDC.button</key>
					<status>0x85</status>
					<midino><?= $button; ?></midino>
					<options>
						<script-binding/>
					</options>
				</control>
			<?php } ?>
		</controls>	
		<outputs/>	
	</controller>
</MixxxControllerPreset>