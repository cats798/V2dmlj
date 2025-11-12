// ==UserScript==
// @name         自动链接弹幕v2
// @namespace    http://tampermonkey.net/
// @version      2.0.9
// @description  自动获取播放链接并从服务器获取弹幕【30%折扣代码：CHEAP】
// @author       huangxd
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @connect      *
// @require      https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js
// @updateURL    https://raw.githubusercontent.com/cats798/V2dmlj/main/dmlj.js
// @downloadURL  https://raw.githubusercontent.com/cats798/V2dmlj/main/dmlj.js
// ==/UserScript==

(function() {
    'use strict';
    
    console.log('自动链接弹幕v2 脚本已加载');
    
    // 配置信息
    const config = {
        version: '2.0.9',
        author: 'huangxd',
        discountCode: 'CHEAP',
        apiEndpoint: 'https://for-ward.vercel.app/api/danmu'
    };
    
    // 主功能类
    class DanmuAutoLink {
        constructor() {
            this.init();
        }
        
        init() {
            this.injectDanmuContainer();
            this.setupEventListeners();
            this.startVideoDetection();
        }
        
        // 注入弹幕容器
        injectDanmuContainer() {
            const danmuCSS = `
                .danmu-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    width: 300px;
                    max-height: 400px;
                    background: rgba(0, 0, 0, 0.8);
                    border: 1px solid #333;
                    border-radius: 8px;
                    color: white;
                    font-family: Arial, sans-serif;
                    z-index: 10000;
                    overflow-y: auto;
                    padding: 10px;
                }
                .danmu-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #444;
                }
                .danmu-title {
                    font-weight: bold;
                    color: #ff4757;
                }
                .danmu-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                }
                .danmu-item {
                    padding: 5px;
                    margin: 5px 0;
                    border-left: 3px solid #ff4757;
                    background: rgba(255, 255, 255, 0.1);
                }
                .discount-badge {
                    background: #ff4757;
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 12px;
                    margin-left: 10px;
                }
            `;
            
            const style = document.createElement('style');
            style.textContent = danmuCSS;
            document.head.appendChild(style);
            
            const container = document.createElement('div');
            container.className = 'danmu-container';
            container.innerHTML = `
                <div class="danmu-header">
                    <span class="danmu-title">自动链接弹幕v2 
                        <span class="discount-badge">折扣码: ${config.discountCode}</span>
                    </span>
                    <button class="danmu-close">×</button>
                </div>
                <div class="danmu-content"></div>
            `;
            
            document.body.appendChild(container);
            
            // 关闭按钮事件
            container.querySelector('.danmu-close').addEventListener('click', () => {
                container
