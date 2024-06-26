var play = play||{};

play.khoitao = function (dosau, map){
	var map = map || com.khoitaoMap;
	var dosau = dosau || 5
	play.my				=	1;				//phía người chơi
	play.nowMap			=	map;
	play.map 			=	com.arr2Clone ( map );		//Khởi tạo bảng
	play.nowManKey		=	false;			//quân cờ để hoạt động bây giờ
	play.pace 			=	[];				//ghi lại từng bước
	play.isPlay 		=	true ;			//bạn có thể chơi cờ không
	
	play.luatchoi 			= 	com.luatchoi;
	play.show 			= 	com.show;
	play.showPane 		= 	com.showPane;
	play.isOffensive	=	true;			//Có nên đi đầu tiên
	play.dosau			=	dosau;			//độ sâu tìm kiếm
	play.isFoul			=	false;			//Có phạm lỗi không?
	com.pane.isShow		=	 false;			//ẩn khối
	
	//xóa tất cả cờ
	play.mans 			=	com.mans	= {};
	
	//Làm như vậy cũng hơi có 2 thứ, biết đâu sau này có sai sót gì thì bỏ qua 1 bên nhớ thay đổi sau
	com.childList.length = 3
	com.createMans( map )		//tạo ra những con tốt
	com.bg.show();
	
	//Khởi tạo quân cờ
	for (var i=0; i<play.map.length; i++){
		for (var n=0; n<play.map[i].length; n++){
			var key = play.map[i][n];
			if (key){
				com.mans[key].x=n;
				com.mans[key].y=i;
				com.mans[key].isShow = true;
			}
		}
	}
	play.show();
	
	//Ràng buộc sự kiện nhấp chuột
	com.canvas.addEventListener("click",play.clickCanvas)
}

//quay lui nước cờ
play.regret = function (){
	var map  = com.arr2Clone(com.khoitaoMap);
	//Khởi tạo tất cả các quân cờ
	for (var i=0; i<map.length; i++){
		for (var n=0; n<map[i].length; n++){
			var key = map[i][n];
			if (key){
				com.mans[key].x=n;
				com.mans[key].y=i;
				com.mans[key].isShow = true;
			}
		}
	}
	var pace= play.pace;
	pace.pop();
	pace.pop();
	
	for (var i=0; i<pace.length; i++){
		var p= pace[i].split("")
		var x = parseInt(p[0], 10);
		var y = parseInt(p[1], 10);
		var newX = parseInt(p[2], 10);
		var newY = parseInt(p[3], 10);
		var key=map[y][x];
		var cMan=map[newY][newX];
		if (cMan) com.mans[map[newY][newX]].isShow = false;
		com.mans[key].x = newX;
		com.mans[key].y = newY;
		map[newY][newX] = key;
		delete map[y][x];
		if (i==pace.length-1){
			com.showPane(newX ,newY,x,y)
		}
	}
	play.map = map;
	play.my=1;
	play.isPlay=true;
	com.show();
}



//Nhấp vào sự kiện bảng
play.clickCanvas = function (e){
	if (!play.isPlay) return false;
	var key = play.getClickMan(e);
	var point = play.getClickPoint(e);
	
	var x = point.x;
	var y = point.y;
	
	if (key){
		play.clickMan(key,x,y);
	}else {
		play.clickPoint(x,y);
	}
	play.isFoul = play.checkFoul();//Kiểm tra xem nó có phải là tướng không
}

//Bấm vào một quân cờ, trong hai trường hợp, chọn hoặc bắt
play.clickMan = function (key,x,y){
	var man = com.mans[key];
	//Ăn
	if (play.nowManKey&&play.nowManKey != key && man.my != com.mans[play.nowManKey ].my){
		//con người là quân cờ đã bị ăn
		if (play.indexOfPs(com.mans[play.nowManKey].ps,[x,y])){
			man.isShow = false;
			var pace=com.mans[play.nowManKey].x+""+com.mans[play.nowManKey].y
			delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
			play.map[y][x] = play.nowManKey;
			com.showPane(com.mans[play.nowManKey].x ,com.mans[play.nowManKey].y,x,y)
			com.mans[play.nowManKey].x = x;
			com.mans[play.nowManKey].y = y;
			com.mans[play.nowManKey].alpha = 1
			
			play.pace.push(pace+x+y);
			play.nowManKey = false;
			com.pane.isShow = false;
			com.dot.dots = [];
			com.show()
			com.get("clickAudio").play();
			setTimeout(play.AIPlay,500);
			if (key == "j0") play.showWin (-1);
			if (key == "J0") play.showWin (1);
		}
	// kiểm tra quân cờ 
	}else{
		if (man.my===1){
			if (com.mans[play.nowManKey]) com.mans[play.nowManKey].alpha = 1 ;
			man.alpha = 0.8;
			com.pane.isShow = false;
			play.nowManKey = key;
			com.mans[key].ps = com.mans[key].bl(); //đạt được tất cả các điểm
			com.dot.dots = com.mans[key].ps
			com.show();
			com.get("selectAudio").play();
		}
	}
}

//bấm vào điểm
play.clickPoint = function (x,y){
	var key=play.nowManKey;
	var man=com.mans[key];
	if (play.nowManKey){
		if (play.indexOfPs(com.mans[key].ps,[x,y])){
			var pace=man.x+""+man.y
			delete play.map[man.y][man.x];
			play.map[y][x] = key;
			com.showPane(man.x ,man.y,x,y)
			man.x = x;
			man.y = y;
			man.alpha = 1;
			play.pace.push(pace+x+y);
			play.nowManKey = false;
			com.dot.dots = [];
			com.show();
			com.get("clickAudio").play();
			setTimeout(play.AIPlay,500);
		}else{
		}
	}
	
}

//Ai cờ vua tự động
play.AIPlay = function (){
	//return
	play.my = -1 ;
	var pace=AI.khoitao(play.pace.join(""))
	if (!pace) {
		play.showWin (1);
		return ;
	}
	play.pace.push(pace.join(""));
	var key=play.map[pace[1]][pace[0]]
		play.nowManKey = key;
	
	var key=play.map[pace[3]][pace[2]];
	if (key){
		play.AIclickMan(key,pace[2],pace[3]);
	}else {
		play.AIclickPoint(pace[2],pace[3]);
	}
	com.get("clickAudio").play();
	
	
}

//Kiểm tra xem tổng thể có
play.checkFoul = function(){
	var p=play.pace;
	var len=parseInt(p.length,10);
	if (len>11&&p[len-1] == p[len-5] &&p[len-5] == p[len-9]){
		return p[len-4].split("");
	}
	return false;
}



play.AIclickMan = function (key,x,y){
	var man = com.mans[key];
	//Ăn
	man.isShow = false;
	delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
	play.map[y][x] = play.nowManKey;
	play.showPane(com.mans[play.nowManKey].x ,com.mans[play.nowManKey].y,x,y)
	com.mans[play.nowManKey].x = x;
	com.mans[play.nowManKey].y = y;
	play.nowManKey = false;
	com.show()
	if (key == "j0") play.showWin (-1);
	if (key == "J0") play.showWin (1);
}

play.AIclickPoint = function (x,y){
	var key=play.nowManKey;
	var man=com.mans[key];
	if (play.nowManKey){
		delete play.map[com.mans[play.nowManKey].y][com.mans[play.nowManKey].x];
		play.map[y][x] = key;	
		com.showPane(man.x,man.y,x,y)	
		man.x = x;
		man.y = y;
		play.nowManKey = false;	
	}
	com.show();
}

play.indexOfPs = function (ps,xy){
	for (var i=0; i<ps.length; i++){
		if (ps[i][0]==xy[0]&&ps[i][1]==xy[1]) return true;
	}
	return false;
	
}

//Điểm để nhận được nhấp chuột
play.getClickPoint = function (e){
	var domXY = com.getDomXY(com.canvas);
	var x=Math.round((e.pageX-domXY.x-com.pointStartX-20)/com.spaceX)
	var y=Math.round((e.pageY-domXY.y-com.pointStartY-20)/com.spaceY)
	return {"x":x,"y":y}
}

//lấy quân cờ
play.getClickMan = function (e){
	var clickXY=play.getClickPoint(e);
	var x=clickXY.x;
	var y=clickXY.y;
	if (x < 0 || x>8 || y < 0 || y > 9) return false;
	return (play.map[y][x] && play.map[y][x]!="0") ? play.map[y][x] : false;
}

play.showWin = function (my){
	play.isPlay = false;
	if (my===1){
		alert("Chúc mừng bạn đã chiến thắng ！");
	}else{
		alert("Xin lỗi bạn đã thua ！");
	}
}