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
// @updateURL    https://raw.githubusercontent.com/YOUR_USERNAME/danmu-auto-link/main/danmu_auto.js
// @downloadURL  https://raw.githubusercontent.com/YOUR_USERNAME/danmu-auto-link/main/danmu_auto.js
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
                container.style.display = 'none';
            });
        }
        
        // 设置事件监听
        setupEventListeners() {
            // 监听视频元素变化
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            this.checkForVideoElements(node);
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        
        // 检测视频元素
        checkForVideoElements(element) {
            const videos = element.querySelectorAll ? element.querySelectorAll('video') : [];
            if (element.tagName === 'VIDEO') {
                this.handleVideoElement(element);
            }
            videos.forEach(video => this.handleVideoElement(video));
        }
        
        // 处理视频元素
        handleVideoElement(video) {
            if (video.dataset.danmuProcessed) return;
            video.dataset.danmuProcessed = 'true';
            
            console.log('检测到视频元素，开始获取弹幕');
            this.fetchDanmu(video.src);
        }
        
        // 开始视频检测
        startVideoDetection() {
            // 检测现有视频元素
            const existingVideos = document.querySelectorAll('video');
            existingVideos.forEach(video => this.handleVideoElement(video));
        }
        
        // 获取弹幕数据
        async fetchDanmu(videoUrl) {
            try {
                const response = await this.gmRequest({
                    method: 'GET',
                    url: `${config.apiEndpoint}?url=${encodeURIComponent(videoUrl)}`,
                    responseType: 'json'
                });
                
                if (response && response.danmu) {
                    this.displayDanmu(response.danmu);
                }
            } catch (error) {
                console.error('获取弹幕失败:', error);
            }
        }
        
        // GM_xmlhttpRequest 封装
        gmRequest(options) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    ...options,
                    onload: function(response) {
                        if (response.status === 200) {
                            try {
                                const data = options.responseType === 'json' ? 
                                    JSON.parse(response.responseText) : response.responseText;
                                resolve(data);
                            } catch (e) {
                                resolve(response.responseText);
                            }
                        } else {
                            reject(new Error(`HTTP ${response.status}: ${response.statusText}`));
                        }
                    },
                    onerror: reject,
                    ontimeout: reject
                });
            });
        }
        
        // 显示弹幕
        displayDanmu(danmuList) {
            const content = document.querySelector('.danmu-content');
            if (!content) return;
            
            danmuList.forEach(danmu => {
                const item = document.createElement('div');
                item.className = 'danmu-item';
                item.textContent = danmu.text;
                content.appendChild(item);
            });
            
            // 限制显示数量
            const items = content.querySelectorAll('.danmu-item');
            if (items.length > 50) {
                for (let i = 0; i < items.length - 50; i++) {
                    content.removeChild(items[i]);
                }
            }
            
            // 自动滚动到底部
            content.scrollTop = content.scrollHeight;
        }
    }
    
    // 等待DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new DanmuAutoLink();
        });
    } else {
        new DanmuAutoLink();
    }
})();
