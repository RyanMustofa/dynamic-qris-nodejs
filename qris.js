let sprintf = require("sprintf-js").sprintf;
let QRCode = require("qrcode");

function trim(str, charlist) {
	let whitespace = [
		" ",
		"\n",
		"\r",
		"\t",
		"\f",
		"\x0b",
		"\xa0",
		"\u2000",
		"\u2001",
		"\u2002",
		"\u2003",
		"\u2004",
		"\u2005",
		"\u2006",
		"\u2007",
		"\u2008",
		"\u2009",
		"\u200a",
		"\u200b",
		"\u2028",
		"\u2029",
		"\u3000",
	].join("");
	let l = 0;
	let i = 0;
	str += "";
	if (charlist) {
		whitespace = (charlist + "").replace(
			/([[\]().?/*{}+$^:])/g,
			"$1"
		);
	}
	l = str.length;
	for (i = 0; i < l; i++) {
		if (
			whitespace.indexOf(str.charAt(i)) === -1
		) {
			str = str.substring(i);
			break;
		}
	}
	l = str.length;
	for (i = l - 1; i >= 0; i--) {
		if (
			whitespace.indexOf(str.charAt(i)) === -1
		) {
			str = str.substring(0, i + 1);
			break;
		}
	}
	return whitespace.indexOf(str.charAt(0)) === -1
		? str
		: "";
}

//example
let qris =
	"00020101021226680016ID.CO.TELKOM.WWW011893600898023809779402150001952380977940303UMI51440014ID.CO.QRIS.WWW0215ID10232515417450303UMI5204549953033605502015405100005802ID5910TOKO HUSEN6011KAB. JEMBER61056818162220511442883062040703A01630467B1";

let qty = "50000";

qris = qris.substring(0, qris.length - 4);
let step1 = qris.replace("010211", "010212");
let step2 = qris.split("5802ID");
let uang =
	"54" + sprintf("%02d", qty.length) + qty;

uang = uang + "5802ID";

let fix = trim(step2[0]) + uang + trim(step2[1]);

// Manage core logic by this variable
var Settlement = [];
Settlement.ord = function (text) {
	var str = text + "",
		code = str.charCodeAt(0);
	if (0xd800 <= code && code <= 0xdbff) {
		var hi = code;
		if (str.length === 1) {
			return code;
		}
		var low = str.charCodeAt(1);
		return (
			(hi - 0xd800) * 0x400 +
			(low - 0xdc00) +
			0x10000
		);
	}
	if (0xdc00 <= code && code <= 0xdfff) {
		return code;
	}
	return code;
};
Settlement.base_convert = function (
	num,
	from_base,
	to_base
) {
	if (
		(from_base && to_base) < 2 ||
		(from_base && to_base) > 36
	) {
		return "Base can be between 2 and 36";
	}

	// Main logic here
	return parseInt(num + "", from_base).toString(
		to_base
	);
};
Settlement.strtoupper = function (str) {
	return (str + "").toUpperCase();
};

function ConvertCRC16(str) {
	function charCodeAt(str, i) {
		return Settlement.ord(str.substr(i, 1));
	}
	let crc = 0xffff;
	let strlen = str.length;
	for (let c = 0; c < strlen; c++) {
		crc ^= charCodeAt(str, c) << 8;
		for (i = 0; i < 8; i++) {
			if (crc & 0x8000) {
				crc = (crc << 1) ^ 0x1021;
			} else {
				crc = crc << 1;
			}
		}
	}
	let hex = crc & 0xffff;
	hex = Settlement.strtoupper(
		Settlement.base_convert(hex, 10, 16)
	);
	if (hex.length == 3) {
		hex = "0" + hex;
	}
	return hex;
}

fix += ConvertCRC16(fix);

console.log("Code :::: ", fix);

QRCode.toDataURL(fix, function (err, url) {
	console.log("URL :::", url);
});
