// ！！！ここに、STEP2でコピーしたウェブアプリのURLを貼り付けてください！！！
const GAS_URL = 'https://script.google.com/macros/s/xxxxxxxxxxxxxxxxxxxxxxxxxxxx/exec';

document.addEventListener('DOMContentLoaded', () => {
    // --- 要素の取得 ---
    const topPage = document.getElementById('top-page');
    const menuPage = document.getElementById('menu-page');
    const showMenuBtn = document.getElementById('show-menu-btn');
    const backToTopBtn = document.getElementById('back-to-top-btn');
    const quantityButtons = document.querySelectorAll('.quantity-btn');
    const submitOrderBtn = document.getElementById('submit-order-btn');
    const modal = document.getElementById('modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const deliveredNumbersDiv = document.getElementById('delivered-numbers');
    
    const quantities = {
        yakisoba: 0,
        frankfurt: 0
    };

    // --- 関数の定義 ---

    // 受け取り済み番号を取得して表示する関数
    function fetchDeliveredNumbers() {
        deliveredNumbersDiv.innerHTML = '<p>読み込み中...</p>';
        fetch(GAS_URL)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.deliveredNumbers.length > 0) {
                    deliveredNumbersDiv.innerHTML = ''; // 中身を空にする
                    data.deliveredNumbers.forEach(num => {
                        const numSpan = document.createElement('span');
                        numSpan.textContent = num;
                        deliveredNumbersDiv.appendChild(numSpan);
                    });
                } else {
                    deliveredNumbersDiv.innerHTML = '<p>お呼び出し中の番号はありません</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching delivered numbers:', error);
                deliveredNumbersDiv.innerHTML = '<p>番号の読み込みに失敗しました</p>';
            });
    }

    // 合計金額を更新する関数
    function updateTotalPrice() {
        const totalPrice = (quantities.yakisoba * 250) + (quantities.frankfurt * 50);
        document.getElementById('total-price').textContent = `¥${totalPrice}`;
    }

    // ページを切り替える関数
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
    }

    // 注文を送信する関数
    function submitOrder() {
        if (quantities.yakisoba === 0 && quantities.frankfurt === 0) {
            alert('ご注文内容を入力してください。');
            return;
        }

        submitOrderBtn.disabled = true;
        submitOrderBtn.textContent = '注文中...';

        fetch(GAS_URL, {
            method: 'POST',
            mode: 'no-cors', // CORSエラーを回避するために必要
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(quantities)
        })
        // no-corsモードではレスポンスが読めないため、スプレッドシート側から最新番号を再取得する
        .then(() => {
            // 少し待ってから最新データを取得
            setTimeout(() => {
                 fetch(GAS_URL)
                    .then(res => res.json())
                    .then(data => {
                        // GAS側で番号を発行し、それを表示するロジックに変更
                        // 最新の注文番号は、一番大きい番号のはず
                        const allNumbers = data.deliveredNumbers.concat(
                            // ここはあくまで簡易的な方法
                            // 本来はGAS側で注文番号を返すのがベスト
                        );
                        // このサンプルではGASのdoPostで予約番号を返す想定で実装
                         alert('申し訳ありません、現在「no-cors」モードの制約により予約番号の直接取得が困難です。Googleスプレッドシートをご確認ください。');
                         // 本来のコードは以下
                         // document.getElementById('order-number').textContent = data.orderNumber;
                         // modal.classList.add('show');
                    })
                    .finally(resetOrderForm);
            }, 2000); // 2秒待つ
        })
        .catch(error => {
            console.error('Error:', error);
            alert('注文の送信に失敗しました。');
        })
        .finally(() => {
            // モーダル表示ロジックはthenの中に移動
        });
    }

    function resetOrderForm(){
        quantities.yakisoba = 0;
        quantities.frankfurt = 0;
        document.getElementById('yakisoba-quantity').textContent = 0;
        document.getElementById('frankfurt-quantity').textContent = 0;
        updateTotalPrice();
        submitOrderBtn.disabled = false;
        submitOrderBtn.textContent = 'これで注文します';
    }


    // --- イベントリスナーの設定 ---

    // メニュー表示ボタン
    showMenuBtn.addEventListener('click', () => showPage('menu-page'));

    // トップへ戻るボタン
    backToTopBtn.addEventListener('click', () => showPage('top-page'));

    // 数量変更ボタン
    quantityButtons.forEach(button => {
        button.addEventListener('click', () => {
            const item = button.dataset.item;
            const change = parseInt(button.dataset.change, 10);
            if (quantities[item] + change >= 0) {
                quantities[item] += change;
                document.getElementById(`${item}-quantity`).textContent = quantities[item];
                updateTotalPrice();
            }
        });
    });
    
    // 注文確定ボタン
    submitOrderBtn.addEventListener('click', submitOrder);

    // モーダルを閉じるボタン
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        showPage('top-page'); // トップページに戻る
        fetchDeliveredNumbers(); // 番号リストを更新
    });
    
    // --- 初期化処理 ---
    fetchDeliveredNumbers();
    showPage('top-page');

});

// doPostのレスポンスがno-corsで取得できないため、以下のように修正・簡略化しました。
// 本来はdoPostから返された予約番号をモーダルに表示します。
// 今回は暫定的に「注文が完了しました」というアラートを出し、フォームをリセットします。

function submitOrder() {
    if (quantities.yakisoba === 0 && quantities.frankfurt === 0) {
        alert('ご注文内容を入力してください。');
        return;
    }

    submitOrderBtn.disabled = true;
    submitOrderBtn.textContent = '注文中...';

    const payload = {
      yakisoba: quantities.yakisoba,
      frankfurt: quantities.frankfurt
    };

    // fetchはPOSTリクエストを送信するだけ
    fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors', 
        cache: 'no-cache',
        redirect: 'follow',
        body: JSON.stringify(payload)
    }).then(() => {
        // 成功したと仮定して処理を進める
        alert('ご注文ありがとうございます！番号はスプレッドシートでご確認ください。');
        modal.classList.add('show');
        // 簡易的に最後の番号+1を表示（あくまで予測）
        const lastNum = Array.from(deliveredNumbersDiv.querySelectorAll('span')).pop();
        const lastNumVal = lastNum ? parseInt(lastNum.textContent) : 0;
        document.getElementById('order-number').textContent = lastNumVal + 1; // あくまで予測値

        resetOrderForm();
    }).catch(error => {
        console.error('Error:', error);
        alert('注文の送信に失敗しました。');
    }).finally(() => {
        // ボタンを元に戻す処理はresetOrderForm内にある
    });
}
