var AI = AI||{};

AI.historyTable	=	{};	//bảng lịch sử

//khởi tạo AI
AI.khoitao = function(pace){
	var bill = AI.historyBill || com.gambit; //Sử dụng thư viện
	if (bill.length){
		var len=pace.length;
		var arr=[];
		//Tìm kiếm kỷ cờ tướng đầu tiên
		for (var i=0;i< bill.length;i++){
			if (bill[i].slice(0,len)==pace) {
			arr.push(bill[i]);
			}
		}
		if (arr.length){
			var inx=Math.floor( Math.random() * arr.length );
			AI.historyBill = arr ;
			return arr[inx].slice(len,len+4).split("");
		}else{
			AI.historyBill = [] ;
		}
	}
	 //Nếu không có gì trong hồ sơ trò chơi, trí tuệ nhân tạo bắt đầu hoạt động
	var khoitaoTime = new Date().getTime();
	AI.treedosau=play.dosau;
	AI.number=0;
	AI.setHistoryTable.lenght = 0
	var val=AI.getAlphaBeta(-99999 ,99999, AI.treedosau, com.arr2Clone(play.map),play.my);
	if (!val||val.value==-8888) {
		AI.treedosau=2;
		val=AI.getAlphaBeta(-99999 ,99999, AI.treedosau, com.arr2Clone(play.map),play.my);
	}
	if (val && val.value != -8888) {
		var man = play.mans[val.key];
		var nowTime = new Date().getTime();
		com.get("moveInfo").innerHTML = '<h3>AI kết quả tìm kiếm trả về : </h3>Di chuyển tốt nhất : ' +
			com.createMove(com.arr2Clone(play.map), man.x, man.y, val.x, val.y) +
			'<br />Độ sâu tìm kiếm: ' + AI.treedosau + '<br />Nhánh tìm kiếm: ' +
			AI.number + ' Nhánh <br />Điểm đánh giá nước đi tốt nhất : ' +
			val.value + ' Điểm' +
			' <br /> Thời gian tìm kiếm: ' +
			(nowTime - khoitaoTime) + ' mili giây = ' + (nowTime - khoitaoTime)/1000 + ' giây'
			return[man.x, man.y, val.x, val.y]
	}
	else {
		return false;
	}
}

//Tìm kiếm đào sâu lặp lại nhiều lần  (IDS)
AI.iterativeSearch = function (map, my){
	var timeOut=100;
	var khoitaodosau = 1;
	var maxdosau = 8;
	AI.treedosau=0;
	var khoitaoTime = new Date().getTime();
	var val = {};
	for (var i=khoitaodosau; i<=maxdosau; i++){
		var nowTime= new Date().getTime();
		AI.treedosau=i;
		AI.aotudosau=i;
		var val = AI.getAlphaBeta(-99999, 99999, AI.treedosau , map ,my)
		if (nowTime-khoitaoTime > timeOut){
			return val;
		}
	}
	return false;
}

//Đọc tất cả các quân cờ trên bàn cờ
AI.getMapAllMan = function (map, my){
	var mans=[];
	for (var i=0; i<map.length; i++){
		for (var n=0; n<map[i].length; n++){
			var key = map[i][n];
			if (key && play.mans[key].my == my){
				play.mans[key].x = n;
				play.mans[key].y = i;
				mans.push(play.mans[key])
			}
		}
	}
	return mans;
}

//Lấy thông tin nước đi của tất cả các quân cờ của bạn trong hồ sơ cờ vua
AI.getMoves = function (map, my){
	var manArr = AI.getMapAllMan (map, my);
	var moves = [];
	var foul=play.isFoul;
	for (var i=0; i<manArr.length; i++){
		var man = manArr[i];
		var val=man.bl(map);
		
		for (var n=0; n<val.length; n++){
			var x=man.x;
			var y=man.y;
			var newX=val[n][0];
			var newY=val[n][1];
			if (foul[0]!=x || foul[1]!=y || foul[2]!=newX || foul[3]!=newY ){
				moves.push([x,y,newX,newY,man.key])
			}
		}
	}
	return moves;
}

//A: giá trị của máy/B: giá trị của đối thủ/dosau：độ sâu
AI.getAlphaBeta = function (A, B, dosau, map ,my) {
	if (dosau == 0) {
		return {"value":AI.evaluate(map , my)}; //Hàm đánh giá trạng thái
　	}
　	var moves = AI.getMoves(map , my ); //Tạo ra tất cả các nước đi di chuyển;
　	//Sắp xếp nước đi ở đây sẽ tăng hiệu quả
	for (var i=0; i < moves.length; i++) {	
　　	//Đi theo hướng này;
		var move= moves[i];
		var key = move[4];
		var oldX= move[0];
		var oldY= move[1];
		var newX= move[2];
		var newY= move[3];
		var clearKey = map[ newY ][ newX ]||"";
		map[ newY ][ newX ] = key;
		delete map[ oldY ][ oldX ];
		play.mans[key].x = newX;
		play.mans[key].y = newY;
	　　if (clearKey=="j0"||clearKey=="J0") {//tướng bị tấn công,hoàn tác di chuyển này;
			play.mans[key]	.x = oldX;
			play.mans[key]	.y = oldY;
			map[ oldY ][ oldX ] = key;
			delete map[ newY ][ newX ];
			if (clearKey){
				 map[ newY ][ newX ] = clearKey;
			}
			return {"key":key,"x":newX,"y":newY,"value":8888};
	　　}else {
	　　	var val = -AI.getAlphaBeta(-B, -A, dosau - 1, map , -my).value;
	　　	//hoàn tác di chuyển này;　
			play.mans[key]	.x = oldX;
			play.mans[key]	.y = oldY;
			map[ oldY ][ oldX ] = key;
			delete map[ newY ][ newX ];
			if (clearKey){
				 map[ newY ][ newX ] = clearKey;
			}
	　　	if (val >= B) {
				//Ghi lại nước đi này trong bảng lịch sử;
				return {"key":key,"x":newX,"y":newY,"value":B};
			}
			if (val > A) {
	　　　　	A = val; //Đặt nước đi tốt nhất;
				if (AI.treedosau == dosau) var rootKey={"key":key,"x":newX,"y":newY,"value":A};
			}
		}
　	}
	//Ghi lại nước đi này trong bảng lịch sử;
	if (AI.treedosau == dosau) {//đệ quy trở về nút gốc
		if (!rootKey){
			//AI không có trạng thái tốt nhất，Chỉ ra rằng AI là chiếu tướng，return false
			return false;
		}else{
			//Đây là nước đi tốt nhất để đi
			return rootKey;
		}
	}
　return {"key":key,"x":newX,"y":newY,"value":A};
}

//Nước đi ăn được ghi vào bảng lịch sử
AI.setHistoryTable = function (txtMap,dosau,value,my){
	AI.setHistoryTable.lenght ++;
	AI.historyTable[txtMap] = {dosau:dosau,value:value}
}

//Đánh giá ván cờ và thu được giá trị chênh lệch giữa các quân cờ ở hai bên bàn cờ
AI.evaluate = function (map,my){
	var val=0;
	for (var i=0; i<map.length; i++){
		for (var n=0; n<map[i].length; n++){
			var key = map[i][n];
			if (key){
				val += play.mans[key].value[i][n] * play.mans[key].my;
			}
		}
	}
	AI.number++;
	return val*my;
}