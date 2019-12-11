<?php 
// php mm.xml.php > "CMD_MM-1_MIDI_1.midi.xml"

echo "<?xml version='1.0' encoding='utf-8'?>"; ?>
<MixxxControllerPreset mixxxVersion="" schemaVersion="1">
    <info>
        <name>Behringer CMD MM-1</name>
        <author>SOUND PEAKS</author>
        <description>4 deck mapping v.23.12.2019</description>
        <wiki>https://mixxx.org/wiki/doku.php/behringer_cmd_mm-1-sp</wiki>
        <forums>https://mixxx.org/forums/viewtopic.php?f=7&amp;t=8762</forums>
    </info>
    <controller id="CMD">
        <scriptfiles>
            <file filename="Behringer-CMD-MM-1-scripts.js" functionprefix="CMDMM"/>
        </scriptfiles>
        <controls>
            <!-- Replace these numbers if midi channel is different: 0xB4 0x84 0x94 to 0xB0\0xB1, ...etc 
                 Behringer CMD MM-1.midi.xml
            -->
            <control>
                <group>[Script]</group>
                <key>CMDMM.fader</key>
                <description>Fader 1</description>
                <status>0xB4</status>
                <midino>0x30</midino>
                <options>
                    <Script-Binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.fader</key>
                <description>Fader 2</description>
                <status>0xB4</status>
                <midino>0x31</midino>
                <options>
                    <Script-Binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.fader</key>
                <description>Fader 3</description>
                <status>0xB4</status>
                <midino>0x32</midino>
                <options>
                    <Script-Binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.fader</key>
                <description>Fader 4</description>
                <status>0xB4</status>
                <midino>0x33</midino>
                <options>
                    <Script-Binding/>
                </options>
            </control>
            <?php $z = 6; for ($i = 1; $i <= 4; $i++, $z++) { ?>
<control>
                <group>[Script]</group>
                <key>CMDMM.fader</key>
                <description>Low EQ</description>
                <status>0xB4</status>
                <midino><?=sprintf("0x%02x", ($z + 8))?></midino>
                <options>
                    <script-binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.fader</key>
                <description>Mid EQ</description>
                <status>0xB4</status>
                <midino><?=sprintf("0x%02x", $z + 4)?></midino>
                <options>
                    <script-binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.fader</key>
                <description>Hi EQ</description>
                <status>0xB4</status>
                <midino><?=sprintf("0x%02x", $z)?></midino>
                <options>
                    <script-binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.fader</key>
                <description>Rotary 4</description>
                <status>0xB4</status>
                <midino><?=sprintf("0x%02x", $z + 12)?></midino>
                <options>
                    <script-binding/>
                </options>
            </control>
           <?php } ?>
            
            
            <!-- 1&2 buttons -->
            <?php $z = 0x84; for ($i = 0; $i <= 1; $i++) { ?>
<control>
                <group>[Script]</group>
                <key>CMDMM.button</key>
                <status><?=sprintf("0x%02x", $z); ?></status>
                <midino>0x13</midino>
                <options>
                    <script-binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.button</key>
                <status><?=sprintf("0x%02x", $z); ?></status>
                <midino>0x14</midino>
                <options>
                    <script-binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.button</key>
                <status><?=sprintf("0x%02x", $z); ?></status>
                <midino>0x17</midino>
                <options>
                    <script-binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.button</key>
                <status><?=sprintf("0x%02x", $z); ?></status>
                <midino>0x18</midino>
                <options>
                    <script-binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.button</key>
                <status><?=sprintf("0x%02x", $z); ?></status>
                <midino>0x1B</midino>
                <options>
                    <script-binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.button</key>
                <status><?=sprintf("0x%02x", $z); ?></status>
                <midino>0x1C</midino>
                <options>
                    <script-binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.button</key>
                <status><?=sprintf("0x%02x", $z); ?></status>
                <midino>0x1F</midino>
                <options>
                    <script-binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.button</key>
                <status><?=sprintf("0x%02x", $z); ?></status>
                <midino>0x20</midino>
                <options>
                    <script-binding/>
                </options>
            </control>
            <?php $z = 0x94; } ?>
            
            
            <!-- PLAYLIST -->
            <control>
                <group>[Playlist]</group>
                <key>CMDMM.librarySwitch</key>
                <description>Switch to the left part of the library with folders</description>
                <status>0x94</status>
                <midino>0x10</midino>
                <options>
                    <Script-Binding/>
                </options>
            </control>
            <control>
                <group>[Playlist]</group>
                <key>CMDMM.librarySwitch</key>
                <status>0x84</status>
                <midino>0x10</midino>
                <options>
                    <Script-Binding/>
                </options>
            </control>
            <control>
                <group>[Playlist]</group>
                <key>CMDMM.librarySwitch</key>
                <description>Switch to the right</description>
                <status>0x94</status>
                <midino>0x11</midino>
                <options>
                    <Script-Binding/>
                </options>
            </control>
            <control>
                <group>[Playlist]</group>
                <key>CMDMM.librarySwitch</key>
                <description></description>
                <status>0x84</status>
                <midino>0x11</midino>
                <options>
                    <Script-Binding/>
                </options>
            </control>
            <control>
                <group>[Playlist]</group>
                <key>CMDMM.librarySwitch</key>
                <status>0xB4</status>
                <midino>0x03</midino>
                <options>
                    <Script-Binding/>
                </options>
            </control>
            <control>
                <group>[Playlist]</group>
                <key>CMDMM.librarySwitch</key>
                <status>0x94</status>
                <midino>0x03</midino>
                <options>
                    <Script-Binding/>
                </options>
            </control>
            <control>
                <group>[Playlist]</group>
                <key>CMDMM.librarySwitch</key>
                <status>0x84</status>
                <midino>0x03</midino>
                <options>
                    <Script-Binding/>
                </options>
            </control>
            
            <!-- MASTER -->
            <control>
                <group>[Master]</group>
                <key>volume</key>
                <description>MIDI Learned from 280 messages.</description>
                <status>0xB4</status>
                <midino>0x02</midino>
                <options>
                    <Normal/>
                </options>
            </control>
            <control>
                <group>[PreviewDeck1]</group>
                <key>pregain</key>
                <status>0xB4</status>
                <midino>0x04</midino>
                <options>
                    <Normal/>
                </options>
            </control>
            <control>
                <group>[Master]</group>
                <key>headMix</key>
                <description>MIDI Learned from 402 messages.</description>
                <status>0xB4</status>
                <midino>0x05</midino>
                <options>
                    <Normal/>
                </options>
            </control>

            <control>
                <group>[Master]</group>
                <key>headGain</key>
                <description>MIDI Learned from 350 messages.</description>
                <status>0xB4</status>
                <midino>0x01</midino>
                <options>
                    <Normal/>
                </options>
            </control>
            <control>
                <group>[Master]</group>
                <key>crossfader</key>
                <status>0xB4</status>
                <midino>0x40</midino>
                <options>
                    <Normal/>
                </options>
            </control>
            
            <control>
                <group>[Master]</group>
                <key>CMDMM.shift</key>
                <description>Shift key</description>
                <status>0x94</status>
                <midino>0x12</midino>
                <options>
                    <Script-Binding/>
                </options>
            </control>
            <control>
                <group>[Master]</group>
                <key>CMDMM.shift</key>
                <description>Shift key</description>
                <status>0x84</status>
                <midino>0x12</midino>
                <options>
                    <Script-Binding/>
                </options>
            </control>


            <!-- PFL -->
            <control>
                <group>[Script]</group>
                <key>CMDMM.button</key>
                <status>0x94</status>
                <midino>0x30</midino>
                <options>
                    <script-binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.button</key>
                <status>0x94</status>
                <midino>0x31</midino>
                <options>
                    <script-binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.button</key>
                <status>0x94</status>
                <midino>0x32</midino>
                <options>
                    <script-binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.button</key>
                <status>0x94</status>
                <midino>0x33</midino>
                <options>
                    <script-binding/>
                </options>
            </control>   
            <control>
                <group>[Script]</group>
                <key>CMDMM.button</key>
                <status>0x84</status>
                <midino>0x30</midino>
                <options>
                    <script-binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.button</key>
                <status>0x84</status>
                <midino>0x31</midino>
                <options>
                    <script-binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.button</key>
                <status>0x84</status>
                <midino>0x32</midino>
                <options>
                    <script-binding/>
                </options>
            </control>
            <control>
                <group>[Script]</group>
                <key>CMDMM.button</key>
                <status>0x84</status>
                <midino>0x33</midino>
                <options>
                    <script-binding/>
                </options>
            </control>            
        </controls>            
    </controller>
</MixxxControllerPreset>
