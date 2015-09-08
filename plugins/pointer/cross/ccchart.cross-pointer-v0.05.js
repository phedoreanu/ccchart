//ccchart plugin http://ngw.jp/~tato/wp/?p=389

   window.ccchart.m.crossPointer = {
      //説明
      aboutThis_module: {
        name: 'crossPointer',
        version: '0.05',
        create: 20141009,
        dependent: 'ccchart-v1.08.2',
        howtouse: 'http://ccchart.org/plugins/pointer/cross/cross-pointer2.htm',
        demo: 'http://ngw.jp/~tato/wp/?p=799',
        license: 'MIT',
        Author: 'Toshiro Takahashi @toshirot'
      },
      //移動する縦ライン
      crossPointer: function (op){

        //引数 op
        //op.lineColor 線の色(default 'rgba(255, 255, 120, 0.7)')
        //op.xColor 横線の色(default 'rgba(255, 255, 120, 0.7)')
        //op.yColor 縦線の色(default 'rgba(255, 255, 120, 0.7)')
        //op.lineWidth 線の幅(default 1)
        //op.xWidth 横線の幅(default 1)
        //op.yWidth 縦線の幅(default 1)

        //注意 widthout use cssmarker

        var that = this; //カレントccchartオブジェクトを変数thatへ渡す
        var canvas, ctx;
        canvas = that.ops[that.id].canvas;
        ctx = canvas.getContext('2d');
        if(!op)op={};


        //線の色
        var lineColor = op.lineColor || 'rgba(255, 255, 120, 0.7)';
        //横線の色
        var xColor = op.xColor || lineColor || 'rgba(255, 255, 120, 0.7)';
        //縦線の色
        var yColor = op.yColor || lineColor || 'rgba(255, 255, 120, 0.7)';
        //線の幅
        var lineWidth = op.lineWidth || 1;
        //横線の幅
        var xWidth = op.xWidth || lineWidth || 1;
        //縦線の幅
        var yWidth = op.yWidth || lineWidth || 1;
        //カーソルポインタ描画毎に発生するイベント
        var onCpDraw = op.onCpDraw || onCpDraw || function(){};

        //borderとpadding分のずれ修正用値取得
        var paddingTop = getNum('padding-top');
        var paddingLeft = getNum('padding-left');
        var borderTopWidth = getNum('border-top-width');
        var borderLeftWidth = getNum('border-left-width');
        var offetT = paddingTop + borderTopWidth;
        var offetL = paddingLeft+ borderLeftWidth;

        //各イベント発生時の処理
        canvas.addEventListener("mousemove", mmove);
        canvas.addEventListener("mousedown", mdwn);
        canvas.addEventListener("mouseup", mup);
        canvas.addEventListener("touchmove", mmove);
        canvas.addEventListener("touchstart", mdwn);
        canvas.addEventListener("touchend", mup);

        function drawXLine(x, y){
          //横線
          //上下のチャート領域外なら無視する
          if(y < that.paddingTop)return;
          if(y > that.height - that.paddingBottom)return;

          ctx.save();
          ctx.beginPath();
          //横線の左位置をチャート領域の左パディングとする
          ctx.moveTo(that.paddingLeft, y);
          //横線の右位置をチャート領域の右位置にする
          ctx.lineTo( that.width - that.paddingRight, y);
          //横線の色指定
          ctx.strokeStyle = xColor;
          //横線の幅
          ctx.lineWidth = xWidth;
          //線を描画する
          ctx.stroke();
          ctx.restore();
        }
        function drawYLine(x, y){
          //縦線
          //左右のチャート領域外なら無視する
          if(x < that.paddingLeft)return;
          if(x > that.width - that.paddingRight)return;

          ctx.save();
          ctx.beginPath();
          //縦線の上位置をチャート領域の上パディングとする
          ctx.moveTo(x, that.paddingTop);
          //縦線の下位置をチャート領域の下位置にする
          ctx.lineTo(x, that.height - that.paddingBottom);

          //縦線の色指定
          ctx.strokeStyle = yColor;
          //縦線の幅
          ctx.lineWidth = yWidth;
          //線を描画する
          ctx.stroke();
          ctx.restore();
        }
        function initCanvas(e){
          //キャンバスをリフレッシュする
          var currentId = e.target.id;        //現在のcanvas id
          var op = ccchart.ops[currentId].op; //現在チャートのoption
          that.init(currentId, op);
        }
        function mmove(e) {
          e.preventDefault();
          //カーソル(タッチした)位置を取得
          var xy = getXY(e);
          //ccchart初期化
          initCanvas(e);
          //横線を描く
          drawXLine(xy[0], xy[1]);
          //縦線を描く
          drawYLine(xy[0], xy[1]);

          if(onCpDraw)onCpDraw(e,that,xy)
        }
        function mdwn(e) {
          e.preventDefault();
          //カーソルを変更
          canvas.style.cursor = 'move';
          //現在のパスをリセットして開始する
          ctx.beginPath();
        }
        function mup(e) {
          e.preventDefault();
          //カーソルを元に戻す
          canvas.style.cursor = 'default';
          //最終座標と開始座標を結んでパスを閉じる
          ctx.closePath();
        }

        //X,Yの位置を取得する
        function getXY(e){
          //canvas自体のleft,topを引いたcanvas内座標を配列[x,y]で返す
          if(e.touches)e = e.touches[0];//for モバイル
          var rect = e.target.getBoundingClientRect();
          //Canvasの元サイズとCSS変形後のスケール比を取得する
          var scale = getScaleWH(that.id);

          var x = e.clientX - rect.left;
          var y = e.clientY - rect.top;
          //スケールやborder,paddingのずれも修正する
          return [x*scale.x-offetL, y*scale.y-offetT];
        }

        /**
         * キャンバスサイズ変更時のずれ修正用関数
         */
        //現在のCanvasサイズをObject {w:with,h:height}で取得する
        function getCanvasWH(id){
          var cs = getComputedStyle(document.getElementById(id));
          return { w:parseInt(cs.width), h:parseInt(cs.height)};
        }
        //元のサイズと現在のCanvasサイズの比率をObject {x:value y:value} で取得する
        function getScaleWH(id){
          var cs = getCanvasWH(id);
          return { x:canvas.width/cs.w, y:canvas.height/cs.h};
        }

        /**
         * キャンバスのborderとpadding取得用関数
         */
        function getNum(prop){
          return parseFloat(
            document
            .defaultView
            .getComputedStyle(that.canvas, '')
            .getPropertyValue(prop), 10
           )||0;
        }
        return this;
      }
    };
