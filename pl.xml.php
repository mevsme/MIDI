<?php 
//php pl.xml.php > "CMD_PL-1_MIDI_1.midi.xml"

$buttons = array('0x00', '0x01', '0x02', '0x03', '0x04', '0x05', '0x06', '0x07', '0x18', '0x19', '0x10', '0x11', '0x12', '0x13', '0x14', '0x15', '0x16', '0x17', '0x1A', '0x1B', '0x20', '0x21', '0x22', '0x23', '0x24', '0x25', '0x26', '0x27', '0x1F');
//                 R1     R2       R3      R4      R5       R6     R7      R8      LOAD    LOCK    1       2        3      4       5        6      7       8      DECK   SRATCH   SYNC     TAP     CUE     PLAY     <<      >>      -       +      JOG                                                       
$rotaries  = array('0x00', '0x01', '0x02', '0x03', '0x04', '0x05', '0x06', '0x07',  '0x1F');
//                    1      2        3       4       5       6        7      8        JOG
$faders = array(0xE0);

echo "<?xml version='1.0' encoding='utf-8'?>"; ?>
<MixxxControllerPreset mixxxVersion="" schemaVersion="1">
    <info>
        <name>Behringer CMD PL-1</name>
        <author>SOUND PEAKS</author>
        <description>4 deck mapping v.08.12.2019</description>
        <wiki>https://mixxx.org/wiki/doku.php/behringer_cmd_pl-1</wiki>
        <forums>https://mixxx.org/forums/viewtopic.php?f=7&amp;t=8762</forums>
    </info>
    <controller id="CMDPL">
        <scriptfiles>
            <file filename="Behringer-CMD-PL-1-scripts.js" functionprefix="CMDPL"/>
        </scriptfiles>
        <controls>
		<?php
		
		
		for ($ch = 0; $ch <= 3; $ch++) {
			
		foreach ($rotaries as $key => $rotary) { ?>
		<control>
					<group>[Rotary_<?= substr($rotary, 2); ?>]</group>
					<key>CMDPL.rotary</key>
					<status>0xB<?= $ch; ?></status>
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
					<key>CMDPL.button</key>
					<status>0x9<?= $ch; ?></status>
					<midino><?= $button; ?></midino>
					<options>
						<script-binding/>
					</options>
				</control>
				<control>
					<group>[Button_<?= substr($button, 2); ?>]</group>
					<key>CMDPL.button</key>
					<status>0x8<?= $ch; ?></status>
					<midino><?= $button; ?></midino>
					<options>
						<script-binding/>
					</options>
				</control>
			<?php }
			
		foreach ($faders as $key => $fader) { ?>
		<control>
					<group>[Fader_<?= $ch; ?>]</group>
					<key>CMDPL.fader</key>
					<status><?= $fader + $ch; ?></status>
					<midino></midino>
					<options>
						<script-binding/>
					</options>
				</control>
		<?php
		}
			
		} ?>
		</controls>	
        <outputs />
    </controller>
</MixxxControllerPreset>
