import { UI } from '../../js/ui.js';

const standardChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// Toàn bộ 100+ phông chữ
const fontStyles = [
    "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ⓪①②③④⑤⑥⑦⑧⑨",
    "𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟0123456789",
    "𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏0123456789",
    "𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡",
    "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉0123456789",
    "🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉0123456789",
    "ค๒ς๔єŦﻮђเןкl๓ภ๏קợгรtยשฬאץzค๒ς๔єŦﻮђเןкl๓ภ๏קợгรtยשฬאץz0123456789",
    "ꋫꃃꏸꁕꍟꄘꁍꑛꂑꀭꀗ꒒ꁒꁹꆂꉣꁸ꒓ꌚ꓅ꐇꏝꅐꇓꐟꁴꋫꃃꏸꁕꍟꄘꁍꑛꂑꀭꀗ꒒ꁒꁹꆂꉣꁸ꒓ꌚ꓅ꐇꏝꅐꇓꐟꁴ0123456789",
    "ΛϦㄈÐƐFƓнɪﾌҚŁ௱ЛØþҨ尺らŤЦƔχϤẔΛϦㄈÐƐFƓнɪﾌҚŁ௱ЛØþҨ尺らŤЦƔχϤẔ0123456789",
    "ﾑ乃cdeｷgんﾉﾌズﾚʍ刀Oｱq尺丂ｲu√wﾒﾘ乙ﾑ乃cdeｷgんﾉﾌズﾚʍ刀Oｱq尺丂ｲu√wﾒﾘ乙0123456789",
    "A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Z̶a̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z̶0̶1̶2̶3̶4̶5̶6̶7̶8̶9̶",
    "A̷B̷C̷D̷E̷F̷G̷H̷I̷J̷K̷L̷M̷N̷O̷P̷Q̷R̷S̷T̷U̷V̷W̷X̷Y̷Z̷a̷b̷c̷d̷e̷f̷g̷h̷i̷j̷k̷l̷m̷n̷o̷p̷q̷r̷s̷t̷u̷v̷w̷x̷y̷z̷0̷1̷2̷3̷4̷5̷6̷7̷8̷9̷",
    "A͟B͟C͟D͟E͟F͟G͟H͟I͟J͟K͟L͟M͟N͟O͟P͟Q͟R͟S͟T͟U͟V͟W͟X͟Y͟Z͟a͟b͟c͟d͟e͟f͟g͟h͟i͟j͟k͟l͟m͟n͟o͟p͟q͟r͟s͟t͟u͟v͟w͟x͟y͟z͟0͟1͟2͟3͟4͟5͟6͟7͟8͟9͟",
    "ᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾᵟᴿˢᵀᵁⱽᵂˣʸᶻᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖᵠʳˢᵀᵘᵛʷˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹",
    "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ0123456789",
    "ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ０１２３４５６７８９",
    "𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟗𝟖𝟗",
    "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻0123456789",
    "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵",
    "𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯0123456789",
    "ĂB̆C̆D̆ĔF̆ĞH̆ĬJ̆K̆L̆M̆N̆ŎP̆Q̆R̆S̆T̆ŬV̆W̆X̆Y̆Z̆ăb̆c̆d̆ĕf̆ğh̆ĭj̆k̆l̆m̆n̆ŏp̆q̆r̆s̆t̆ŭv̆w̆x̆y̆z̆0̆1̆2̆3̆4̆5̆6̆7̆8̆9̆",
    "ȂB̑C̑D̑ȆF̑G̑H̑ȊJ̑K̑L̑M̑N̑ȎP̑Q̑ȒS̑T̑ȖV̑W̑X̑Y̑Z̑ȃb̑c̑d̑ȇf̑g̑h̑ȋj̑k̑l̑m̑n̑ȏp̑q̑ȓs̑t̑ȗv̑w̑x̑y̑z̑0̑1̑2̑3̑4̑5̑6̑7̑8̑9̑",
    "ÃB̃C̃D̃ẼF̃G̃H̃ĨJ̃K̃L̃M̃ÑÕP̃Q̃R̃S̃T̃ŨṼW̃X̃ỸZ̃ãb̃c̃d̃ẽf̃g̃h̃ĩj̃k̃l̃m̃ñõp̃q̃r̃s̃t̃ũṽw̃x̃ỹz̃0̃1̃2̃3̃4̃5̃6̃7̃8̃9̃",
    "ÅB̊C̊D̊E̊F̊G̊H̊I̊J̊K̊L̊M̊N̊O̊P̊Q̊R̊S̊T̊ŮV̊W̊X̊Y̊Z̊åb̊c̊d̊e̊f̊g̊h̊i̊j̊k̊l̊m̊n̊o̊p̊q̊r̊s̊t̊ův̊ẘx̊ẙz̊0̊1̊2̊3̊4̊5̊6̊7̊8̊9̊",
    "A̋B̋C̋D̋E̋F̋G̋H̋I̋J̋K̋L̋M̋N̋ŐP̋Q̋R̋S̋T̋ŰV̋W̋X̋Y̋Z̋a̋b̋c̋d̋e̋f̋g̋h̋i̋j̋k̋l̋m̋n̋őp̋q̋r̋s̋t̋űv̋w̋x̋y̋z̋0̋1̋2̋3̋4̋5̋6̋7̋8̋9̋",
    "ǍB̌ČĎĚF̌ǦȞǏJ̌ǨĽM̌ŇǑP̌Q̌ŘŠŤǓV̌W̌X̌Y̌Žǎb̌čďěf̌ǧȟǐǰǩľm̌ňǒp̌q̌řšťǔv̌w̌x̌y̌ž0̌1̌2̌3̌4̌5̌6̌7̌8̌9̌",
    "A̍B̍C̍D̍E̍F̍G̍H̍I̍J̍K̍L̍M̍N̍O̍P̍Q̍R̍S̍T̍U̍V̍W̍X̍Y̍Z̍a̍b̍c̍d̍e̍f̍g̍h̍i̍j̍k̍l̍m̍n̍o̍p̍q̍r̍s̍t̍u̍v̍w̍x̍y̍z̍0̍1̍2̍3̍4̍5̍6̍7̍8̍9̍",
    "A̎B̎C̎D̎E̎F̎G̎H̎I̎J̎K̎L̎M̎N̎O̎P̎Q̎R̎S̎T̎U̎V̎W̎X̎Y̎Z̎a̎b̎c̎d̎e̎f̎g̎h̎i̎j̎k̎l̎m̎n̎o̎p̎q̎r̎s̎t̎u̎v̎w̎x̎y̎z̎0̎1̎2̎3̎4̎5̎6̎7̎8̎9̎",
    "A̐B̐C̐D̐E̐F̐G̐H̐I̐J̐K̐L̐M̐N̐O̐P̐Q̐R̐S̐T̐U̐V̐W̐X̐Y̐Z̐a̐b̐c̐d̐e̐f̐g̐h̐i̐j̐k̐l̐m̐n̐o̐p̐q̐r̐s̐t̐u̐V̐w̐x̐y̐z̐0̐1̐2̐3̐4̐5̐6̐7̐8̐9̐",
    "A҈B҈C҈D҈E҈F҈G҈H҈I҈J҈K҈L҈M҈N҈O҈P҈Q҈R҈S҈T҈U҈V҈W҈X҈Y҈Z҈a҈b҈c҈d҈e҈f҈g҈h҈i҈j҈k҈l҈m҈n҈o҈p҈q҈r҈s҈t҈u҈v҈w҈x҈y҈z҈0҈1҈2҈3҈4҈5҈6҈7҈8҈9҈",
    "A҉B҉C҉D҉E҉F҉G҉H҉I҉J҉K҉L҉M҉N҉O҉P҉Q҉R҉S҉T҉U҉V҉W҉X҉Y҉Z҉a҉b҉c҉d҉e҉f҉g҉h҉i҉j҉k҉l҉m҉n҉o҉p҉q҉r҉s҉t҉u҉v҉w҉x҉y҉z҉0҉1҉2҉3҉4҉5҉6҉7҉8҉9҉",
    "A͎B͎C͎D͎E͎F͎G͎H͎I͎J͎K͎L͎M͎N͎O͎P͎Q͎R͎S͎T͎U͎V͎W͎X͎Y͎Z͎a͎b͎c͎d͎e͎f͎g͎h͎i͎j͎k͎l͎m͎n͎o͎p͎q͎r͎s͎t͎u͎v͎w͎x͎y͎z͎0͎1͎2͎3͎4͎5͎6͎7͎8͎9͎",
    "A͓B͓C͓D͓E͓F͓G͓H͓I͓J͓K͓L͓M͓N͓O͓P͓Q͓R͓S͓T͓U͓V͓W͓X͓Y͓Z͓a͓b͓c͓d͓e͓f͓g͓h͓i͓j͓k͓l͓m͓n͓o͓p͓q͓r͓s͓t͓u͓v͓w͓x͓y͓z͓0͓1͓2͓3͓4͓5͓6͓7͓8͓9͓",
    "ÁB́ĆD́ÉF́ǴH́ÍJ́ḰĹḾŃÓṔQ́ŔŚT́ÚV́ẂX́ÝŹáb́ćd́éf́ǵh́íj́ḱĺḿńóṕq́ŕśt́úv́ẃx́ýź0́1́2́3́4́5́6́7́8́9́",
    "ÀB̀C̀D̀ÈF̀G̀H̀ÌJ̀K̀L̀M̀ǸÒP̀Q̀R̀S̀T̀ÙV̀ẀX̀ỲZ̀àb̀c̀d̀èf̀g̀h̀ìj̀k̀l̀m̀ǹòp̀q̀r̀s̀t̀ùv̀ẁx̀ỳz̀0̀1̀2̀3̀4̀5̀6̀7̀8̀9̀",
    "ꍏꌃꉓꀸꍟꎇꁅꃅꀤꀭꀘ꒒ꎭꈤꂦᖘꆰꋪꌗ꓄ꀎᐯꅏꊼꌩꁴꍏꌃꉓꀸꍟꎇꁅꃅꀤꀭꀘ꒒ꎭꈤꂦᖘꆰꋪꌗ꓄ꀎᐯꅏꊼꌩꁴ0123456789",
    "ค๖¢໓ēfງhiวkl๓ຖ໐p๑rŞtนงຟxฯຊค๖¢໓ēfງhiวkl๓ຖ໐p๑rŞtนงຟxฯຊ0123456789",
    "αβςδεfɠɧίʝκɭɱησρqɾʂτμνωχγζαβςδεfɠɧίʝκɭɱησρqɾʂτμνωχγζ0123456789",
    "ąҍϲժҽƒցհíյƘӀʍղօԹզɾՏԵմѵա×վՀąҍϲժҽƒցհíյƘӀʍղօԹզɾՏԵմѵա×վՀ0123456789",
    "ДБCDΞFGHIKLMNФPǪЯSTЦVЩЖУZДБCDΞFGHIKLMNФPǪЯSTЦVЩЖУZ0123456789",
    "A░B░C░D░E░F░G░H░I░J░K░L░M░N░O░P░Q░R░S░T░U░V░W░X░Y░Z░a░b░c░d░e░f░g░h░i░j░k░l░m░n░o░p░q░r░s░t░u░v░w░x░y░z░0░1░2░3░4░5░6░7░8░9░",
    "A꙰B꙰C꙰D꙰E꙰F꙰G꙰H꙰I꙰J꙰K꙰L꙰M꙰N꙰O꙰P꙰Q꙰R꙰S꙰T꙰U꙰V꙰W꙰X꙰Y꙰Z꙰a꙰b꙰c꙰d꙰e꙰f꙰g꙰h꙰i꙰j꙰k꙰l꙰m꙰n꙰o꙰p꙰q꙰r꙰s꙰t꙰u꙰v꙰w꙰x꙰y꙰z꙰0꙰1꙰2꙰3꙰4꙰5꙰6꙰7꙰8꙰9꙰",
    "A⃟B⃟C⃟D⃟E⃟F⃟G⃟H⃟I⃟J⃟K⃟L⃟M⃟N⃟O⃟P⃟Q⃟R⃟S⃟T⃟U⃟V⃟W⃟X⃟Y⃟Z⃟a⃟b⃟c⃟d⃟e⃟f⃟g⃟h⃟i⃟j⃟k⃟l⃟m⃟n⃟o⃟p⃟q⃟r⃟s⃟t⃟u⃟v⃟w⃟x⃟y⃟z⃟0⃟1⃟2⃟3⃟4⃟5⃟6⃟7⃟8⃟9⃟"
];

const leftOptions = [
    "౨ৎ", "꧁༒", "ミ★", "★_", "亗", "ϟ", "♰", "", "❖︵", "『", "‿✿", "么", "》", "✿", "♔⋆", 
    "ㅤ༆ᵀᵉᵃᵐ", "×͜×ㅤ", "ʚရှီɞ", "╰‿╯", "︻╦̵̵͇̿̿̿̿╤─", "๖²⁴ʱ", "༄●⃝", "『", "★彡[", "ㅤूाीू", "ღ", "❥"
];

const centerOptions = [
    "•", "۶", "☆", "丶", "™", "乂", "♥", "✯", "❣", "ッ", "▽", "↭", "┊", "ܔ", "✿", "×", "★"
];

const rightOptions = [
    "🎀", "༒꧂", "★彡", "ツ", "ෆ", "⚡︎", "♰", "☃︎", "‿✶", "』•ᴮᴬᴰʙᴏʏツ", "╰⁔╯₄₇", "《", "➻❥", 
    "⋆♔", "★࿐", "Mặt quỷ", "♡ᶜᵘᵗᵉ♪", "✔", "ジ۵", "✿ᴳᴵᴿᴸ࿐", "』ᴷᴺᴵᴳᴴᵀ༒࿐", "⁀ᶜᵘᵗᵉ"
];

const textColors = [
    'text-blue-500 dark:text-blue-400', 'text-emerald-500 dark:text-emerald-400', 'text-red-500 dark:text-red-400', 
    'text-amber-500 dark:text-amber-400', 'text-violet-500 dark:text-violet-400', 'text-pink-500 dark:text-pink-400', 
    'text-cyan-500 dark:text-cyan-400', 'text-teal-500 dark:text-teal-400', 'text-fuchsia-500 dark:text-fuchsia-400'
];

const defaultNames = ['Hunq AIO'];

export function template() {
    return `
        <style>
            /* Scrollbar */
            .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; }

            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { scrollbar-width: none; }

            /* Buttons */
            .btn-premium { transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s; user-select: none; cursor: pointer; }
            .btn-premium:active { transform: scale(0.96); opacity: 0.8; }
            .btn-premium:disabled { opacity: 0.4; pointer-events: none; transform: scale(1); }

            /* Toggle Switch */
            .toggle-premium { appearance: none; width: 40px; height: 22px; background: #e4e4e7; border-radius: 11px; position: relative; cursor: pointer; outline: none; transition: background 0.2s; flex-shrink: 0; }
            .dark .toggle-premium { background: #27272a; }
            .toggle-premium::after { content: ''; position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: #fff; border-radius: 50%; transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            .toggle-premium:checked { background: #18181b; }
            .dark .toggle-premium:checked { background: #fff; }
            .toggle-premium:checked::after { transform: translateX(18px); background: #fff; }
            .dark .toggle-premium:checked::after { background: #18181b; }

            /* Animation */
            .ui-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
            
            .kytu-select-wrapper { position: relative; }
            .kytu-select-wrapper::after {
                content: "▼"; position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
                font-size: 10px; color: #a1a1aa; pointer-events: none;
            }
        </style>

        <div class="relative flex flex-col w-full max-w-[1000px] mx-auto min-h-[600px] pb-10">
            
            <div class="mb-8 px-2 ui-fade-in">
                <h2 class="text-[28px] font-black text-zinc-900 dark:text-white tracking-tight leading-none mb-2">Tạo Tên Kí Tự Đặc Biệt</h2>
                <p class="text-[13px] text-zinc-500 font-medium">Kết hợp hàng trăm phông chữ và biểu tượng đẹp mắt cho tên Game, MXH.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start ui-fade-in" style="animation-delay: 100ms;">
                
                <!-- Left Panel: Controls -->
                <div class="lg:col-span-5 space-y-6">
                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6">
                        <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Tùy chỉnh Tên</h3>
                        
                        <!-- Name Input -->
                        <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 focus-within:ring-2 ring-zinc-900 dark:ring-white transition-all mb-4">
                            <label for="kytu-nameInput" class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Nhập tên của bạn</label>
                            <input type="text" id="kytu-nameInput" class="w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white p-0 placeholder-zinc-400" placeholder="Ví dụ: Hunq AIO...">
                        </div>

                        <!-- Decorator Selects -->
                        <div class="space-y-3 mb-4">
                            <div class="flex gap-3">
                                <div class="flex-1 bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-3 kytu-select-wrapper">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Trái</label>
                                    <select id="kytu-leftChar" class="w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white cursor-pointer appearance-none">
                                        <option value="">(Không)</option>
                                    </select>
                                </div>
                                <div class="flex-1 bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-3 kytu-select-wrapper">
                                    <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Giữa</label>
                                    <select id="kytu-centerChar" class="w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white cursor-pointer appearance-none">
                                        <option value="">(Trống)</option>
                                    </select>
                                </div>
                            </div>
                            <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-3 kytu-select-wrapper">
                                <label class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Phải</label>
                                <select id="kytu-rightChar" class="w-full bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-white cursor-pointer appearance-none">
                                    <option value="">(Không)</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Random Toggle -->
                        <div class="bg-zinc-50 dark:bg-[#121214]/50 rounded-2xl p-4 flex items-center justify-between mb-5">
                            <div>
                                <span class="text-sm font-bold text-zinc-700 dark:text-zinc-300 block">Trang trí ngẫu nhiên</span>
                                <span class="text-[11px] text-zinc-500 font-medium">Tự động chọn kí tự 2 bên</span>
                            </div>
                            <input type="checkbox" id="kytu-isRandom" class="toggle-premium" checked>
                        </div>

                        <!-- Generate Button -->
                        <button id="kytu-btnGenerate" class="btn-premium w-full py-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2">
                            <span>Tạo Danh Sách</span>
                        </button>
                    </div>
                </div>

                <!-- Right Panel: Results -->
                <div class="lg:col-span-7">
                    <div class="ui-block bg-white dark:bg-[#0c0c0e] rounded-[32px] ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800/80 p-6 flex flex-col min-h-[500px] lg:h-[650px]">
                        
                        <div class="flex justify-between items-center mb-4 shrink-0">
                            <h3 class="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Danh sách kết quả</h3>
                            <span id="kytu-resultCount" class="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded-md">0 mẫu</span>
                        </div>

                        <!-- Scrollable Output -->
                        <div id="kytu-scrollArea" class="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                            <div id="kytu-emptyState" class="text-center text-zinc-400 dark:text-zinc-500 text-sm py-20 font-medium flex flex-col items-center gap-3">
                                <svg class="w-12 h-12 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                Nhập tên và bấm tạo để xem toàn bộ kết quả...
                            </div>
                            
                            <div id="kytu-resultContainer" class="space-y-3">
                                <!-- Results injected here -->
                            </div>

                            <!-- Lazy Loading Sentinel -->
                            <div id="kytu-loadingSentinel" class="hidden py-6 mt-2 flex items-center justify-center gap-2">
                                <div class="w-4 h-4 rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white animate-spin"></div>
                                <span class="text-xs font-bold text-zinc-400 uppercase tracking-widest">Đang tải thêm...</span>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    `;
}

export function init() {
    let allResultsData = [];
    let currentIndex = 0;
    const chunkSize = 20;

    // Helper functions
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    function convertTextToStyle(text, styleChars) {
        let result = "";
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            let index = standardChars.indexOf(char);
            if (index !== -1 && index < styleChars.length / 2) { 
                let styleArr = Array.from(styleChars); 
                if(index < styleArr.length) {
                    result += styleArr[index];
                } else {
                    result += char;
                }
            } else {
                result += char;
            }
        }
        return result;
    }

    function populateSelects() {
        const leftSelect = document.getElementById('kytu-leftChar');
        const centerSelect = document.getElementById('kytu-centerChar');
        const rightSelect = document.getElementById('kytu-rightChar');

        if(leftSelect) leftOptions.forEach(opt => leftSelect.add(new Option(opt, opt)));
        if(centerSelect) centerOptions.forEach(opt => centerSelect.add(new Option(opt, opt)));
        if(rightSelect) rightOptions.forEach(opt => rightSelect.add(new Option(opt, opt)));
    }

    function generateData() {
        const nameInputEl = document.getElementById('kytu-nameInput');
        if(!nameInputEl) return;
        
        const nameInput = nameInputEl.value.trim();
        const baseName = nameInput || getRandom(defaultNames);
        const isRandom = document.getElementById('kytu-isRandom').checked;
        
        const sLeft = document.getElementById('kytu-leftChar').value;
        const sCenter = document.getElementById('kytu-centerChar').value;
        const sRight = document.getElementById('kytu-rightChar').value;

        allResultsData = [];
        currentIndex = 0;

        const iterations = isRandom ? 3 : 1;

        for (let k = 0; k < iterations; k++) {
            fontStyles.forEach(style => {
                let lChar = sLeft;
                let cChar = sCenter;
                let rChar = sRight;

                if (isRandom) {
                    lChar = getRandom(leftOptions) || "";
                    cChar = getRandom(centerOptions) || "";
                    rChar = getRandom(rightOptions) || "";
                }

                let processedName = baseName;
                if (cChar) {
                    processedName = processedName.replace(/\s+/g, cChar);
                } else {
                    processedName = processedName.replace(/\s+/g, ' ');
                }

                let styledName = convertTextToStyle(processedName, style);
                let finalName = `${lChar}${styledName}${rChar}`;
                let color = getRandom(textColors);

                allResultsData.push({ finalName, color });
            });
        }

        const container = document.getElementById('kytu-resultContainer');
        const emptyState = document.getElementById('kytu-emptyState');
        const resultCount = document.getElementById('kytu-resultCount');
        const scrollArea = document.getElementById('kytu-scrollArea');

        if(container) container.innerHTML = '';
        if(emptyState) emptyState.style.display = 'none';
        if(resultCount) resultCount.innerText = `${allResultsData.length} mẫu`;
        if(scrollArea) scrollArea.scrollTop = 0;

        renderNextChunk();
    }

    function renderNextChunk() {
        if (currentIndex >= allResultsData.length) return;

        const container = document.getElementById('kytu-resultContainer');
        if(!container) return;

        const end = Math.min(currentIndex + chunkSize, allResultsData.length);
        
        let htmlContent = '';
        for (let i = currentIndex; i < end; i++) {
            const item = allResultsData[i];
            const safeText = item.finalName.replace(/"/g, '&quot;');
            
            htmlContent += `
                <div class="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl p-4 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors ui-fade-in group">
                    <div class="overflow-x-auto whitespace-nowrap hide-scrollbar flex-1 mr-4">
                        <span class="${item.color} text-lg font-medium tracking-wide">${item.finalName}</span>
                    </div>
                    <button data-text="${safeText}" class="kytu-copy-btn btn-premium bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-700 px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-900 dark:text-white whitespace-nowrap shrink-0">
                        <i class="fa-solid fa-copy"></i>
                    </button>
                </div>
            `;
        }

        container.insertAdjacentHTML('beforeend', htmlContent);
        currentIndex = end;

        const sentinel = document.getElementById('kytu-loadingSentinel');
        if(sentinel) {
            if (currentIndex >= allResultsData.length) {
                sentinel.classList.add('hidden');
                sentinel.classList.remove('flex');
            } else {
                sentinel.classList.remove('hidden');
                sentinel.classList.add('flex');
            }
        }
    }

    function setupLazyLoading() {
        const sentinel = document.getElementById('kytu-loadingSentinel');
        const scrollArea = document.getElementById('kytu-scrollArea');
        if(!sentinel || !scrollArea) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && currentIndex < allResultsData.length) {
                setTimeout(renderNextChunk, 200); 
            }
        }, {
            root: scrollArea,
            rootMargin: '100px',
            threshold: 0.1
        });
        
        observer.observe(sentinel);
    }

    async function copyToClipboard(button, text) {
        try {
            await navigator.clipboard.writeText(text);
            handleCopyUI(button);
            if(typeof UI !== 'undefined' && UI.showAlert) {
                UI.showAlert('Đã sao chép', `Đã lưu "${text}" vào bộ nhớ tạm.`, 'success');
            }
        } catch (err) {
            // Fallback for non-secure contexts
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                handleCopyUI(button);
                if(typeof UI !== 'undefined' && UI.showAlert) {
                    UI.showAlert('Đã sao chép', `Đã lưu vào bộ nhớ tạm.`, 'success');
                }
            } catch (fallbackErr) {
                console.error('Không thể sao chép', fallbackErr);
                if(typeof UI !== 'undefined' && UI.showAlert) {
                    UI.showAlert('Lỗi', 'Trình duyệt không hỗ trợ sao chép.', 'error');
                }
            }
            document.body.removeChild(textArea);
        }
    }

    function handleCopyUI(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
        button.classList.add('bg-zinc-900', 'text-white', 'dark:bg-white', 'dark:text-zinc-900');
        button.classList.remove('bg-white', 'text-zinc-900', 'dark:bg-[#121214]', 'dark:text-white');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('bg-zinc-900', 'text-white', 'dark:bg-white', 'dark:text-zinc-900');
            button.classList.add('bg-white', 'text-zinc-900', 'dark:bg-[#121214]', 'dark:text-white');
        }, 1500);
    }

    const btnGenerate = document.getElementById('kytu-btnGenerate');
    if (btnGenerate) {
        btnGenerate.addEventListener('click', () => {
            const originalContent = btnGenerate.innerHTML;
            btnGenerate.innerHTML = '<div class="w-4 h-4 rounded-full border-2 border-zinc-500 border-t-white dark:border-t-zinc-900 animate-spin"></div> <span>Đang xử lý...</span>';
            setTimeout(() => {
                generateData();
                btnGenerate.innerHTML = originalContent;
            }, 200);
        });
    }
    
    const nameInput = document.getElementById('kytu-nameInput');
    if (nameInput) {
        nameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') generateData();
        });
    }

    const chkRandom = document.getElementById('kytu-isRandom');
    if (chkRandom) {
        chkRandom.addEventListener('change', function(e) {
            const selects = [
                document.getElementById('kytu-leftChar'), 
                document.getElementById('kytu-centerChar'), 
                document.getElementById('kytu-rightChar')
            ];
            selects.forEach(sel => {
                if(sel) {
                    if(e.target.checked) {
                        sel.disabled = true;
                        sel.parentElement.classList.add('opacity-40', 'pointer-events-none');
                    } else {
                        sel.disabled = false;
                        sel.parentElement.classList.remove('opacity-40', 'pointer-events-none');
                    }
                }
            });
        });
    }

    // Event delegation cho các nút copy (do HTML được tạo động)
    const resultContainer = document.getElementById('kytu-resultContainer');
    if (resultContainer) {
        resultContainer.addEventListener('click', function(e) {
            const btn = e.target.closest('.kytu-copy-btn');
            if (btn) {
                const textToCopy = btn.getAttribute('data-text');
                if (textToCopy) {
                    copyToClipboard(btn, textToCopy);
                }
            }
        });
    }

    // Initial Setup
    populateSelects();
    setupLazyLoading();
    
    if (chkRandom) {
        chkRandom.checked = true;
        chkRandom.dispatchEvent(new Event('change'));
    }
    
    // Tự động tạo kết quả ngay khi load
    generateData();
}