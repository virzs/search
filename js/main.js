/*
 * @Author: VirZhang
 * @Date: 2019-11-28 14:32:57
 * @Last Modified by: VirZhang
 * @Last Modified time: 2020-02-10 21:16:17
 */

//配置变量
var searchEngine = ""; //搜索框左侧选择搜索引擎数据
var searchFlag = true; //搜索引标记
var sideBarIconFlag = -1; //侧边栏按钮标记
var commonData = []; //常用网址数据
var changeWebsiteUrl = "";

//获取本地数据
const skinHref = getStorage("skin");
const uiHref = getStorage("uistyle");
const bg = getStorage("bg");
const commonUseData = getStorage("commonUseData");
const showCommonUse = getStorage("showCommonUse");

/*
    导入模块
 */

//所有数据
import {
    jsonData
} from "./module/all.data.mjs";

//DOM元素
import {
    body,
    linkTag,
    uiTag,
    searchContent,
    selectEngine,
    selectOption,
    searchInput,
    searchList,
    sideBar,
    sideBarTitle,
    sideBarContent,
    scrollContent,
    commonUse,
    jinrishiciSentence,
    jinrishiciAuthor,
    jinrishiciTitle,
    copyright,
    loading,
    messageList
} from "./module/dom.constant.mjs";

import {
    toggle,
    setStorageBefore
} from './module/animation.func.mjs';

//搜索相关函数
import {
    goSearch,
    setEngine
} from "./module/search.func.mjs";

//搜索智能提示函数
import {
    getSugValue,
    changeSug
} from "./module/sug.func.mjs";

//本地存储相关函数
import {
    setStorage,
    getStorage
} from './module/storage.func.mjs';

//消息提示函数
import {
    openMessage
} from "./module/message.func.mjs";

//阻止事件冒泡函数
import {
    stopPropagation,
    findSettingInfo
} from "./module/global.func.mjs";

import {
    createWebsite,
    commonWebsite,
    setCommomUse
} from "./module/website.func.mjs";

import {
    setBingImage,
    setCustomizeImage,
    setdefault
} from "./module/bg.func.mjs";

import {
    createSetting
} from "./module/setting.func.mjs";

import {
    changeSkin
} from "./module/skin.func.mjs";

import {
    changeUI
} from "./module/ui.func.mjs";

import {
    openDialog,
    closeDialog
} from "./module/dialog.func.mjs";
/*
    导入模块结束
 */


/*
    加载本地存储区域/自动加载区域
 */
if (bg && bg !== null) {
    body.style.backgroundImage = `url('${bg}')`;
}

if (bg == "setBingImage") {
    setBingImage(true);
}

if (skinHref && skinHref !== null) {
    linkTag.href = skinHref;
}

if (uiHref && uiHref !== null) {
    uiTag.href = uiHref;
}
//默认设置开启显示常用网址功能
if (showCommonUse == "undefined" || showCommonUse == undefined) {
    setStorage("showCommonUse", "website_open");
}

if (commonUseData == undefined) {
    setStorage("commonUseData", "[]");
    setCommomUse(commonData);
}

if (commonUseData && commonUseData !== null) {
    commonData = JSON.parse(commonUseData);
    setCommomUse(commonData);
}

//拼接搜索栏左侧选择引擎
jsonData.engine.forEach(element => {
    if (element.select == "selected") {
        selectEngine.innerHTML = `<img src='${element.icon}'  alt="${element.value}"><span>${element.name}</span><i class="fa fa-sort"></i>`
    }
    searchEngine += `<li id="${element.value}"><img src='${element.icon}'><span>${element.name}</span></li>`;
});
selectOption.innerHTML = `<p>请选择搜索引擎：</p><ul>${searchEngine}</ul>`;

// 动态创建侧边栏图标
for (let item in jsonData.sideBar.content) {
    if (jsonData.sideBar.content[item].show) {
        sideBarTitle.innerHTML += `<div id="${jsonData.sideBar.content[item].name}" class="title-icon" style="color:${jsonData.sideBar.content[item].color};"><i class="${jsonData.sideBar.content[item].icon}"></i></div>`
    }
}

//诗词渲染
jinrishici.load(function (result) {
    jinrishiciSentence.innerHTML = result.data.content
    jinrishiciAuthor.innerHTML = `― ${result.data.origin.author}`
    jinrishiciTitle.innerHTML = `《${result.data.origin.title}》`
});

//版权信息渲染
if (jsonData.copyright.show) {
    copyright.innerHTML = `<a class="copyright" href="${jsonData.copyright.href}">${jsonData.copyright.content}</a>`
}

//渲染侧边栏数据
Array.prototype.forEach.call(sideBarTitle.children, item => {
    item.onclick = () => {
        if (sideBarIconFlag == item.id) {
            sideBar.className = "moveRight";
            sideBarIconFlag = -1
            return;
        }
        switch (item.id) {
            case "Gaming":
                scrollContent.innerHTML = "加班加点摸鱼中，敬请期待";
                sideBarIconFlag = item.id;
                break;
            case "Website":
                scrollContent.innerHTML = createWebsite();
                sideBarIconFlag = item.id;
                break;
            case "Setting":
                scrollContent.innerHTML = createSetting();
                sideBarIconFlag = item.id;
                break;
        }
        sideBar.className = "moveLeft";
        stopPropagation()
    }
})

//网页文档加载完毕调用动画
document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        toggle(loading, 40);
    }
}

/*
    加载本地存储区域/自动加载区域结束
 */


/*
    事件监听/事件委托相关
 */
//监听点击事件
document.addEventListener("click", function (e) {
    //判断选择引擎
    if (e.target !== selectOption && !searchFlag) {
        selectOption.style.display = "none";
        searchFlag = !searchFlag;
    }

    if (e.target == document.querySelector("#search")) {
        getSugValue();
    }

    if (e.target !== searchList) {
        searchList.style.display = "none";
    }

    //判断侧边栏
    if (e.target !== sideBarTitle.children && e.target !== sideBarContent && sideBarIconFlag !== -1) {
        sideBar.className = "moveRight";
        sideBarIconFlag = -1;
    }
    if (e.target.id == "submitDialog") {
        let name = document.querySelector("#nameDialog").children[1].value;
        let url = document.querySelector("#urlDialog").children[1].value;
        if (name == "" || url == "") {
            openMessage({
                title: "提示",
                type: "error",
                content: `名称或URL不能为空！！！`
            })
            return;
        }
        if (url.indexOf("https://") == -1 || url.indexOf("http://") == -1) {
            url = `https://${url}`;
        }
        commonWebsite({
            thisWebsite: {
                name: name,
                href: url,
                color: "#000"
            },
            commonData: commonData,
            add: true
        })
        closeDialog();
    }
    if (e.target.id == "cancelDialog") {
        closeDialog();
    }
    if (e.target.id == "changeDialog") {
        let name = document.querySelector("#nameDialog").children[1].value;
        commonWebsite({
            thisWebsite: {
                name: name,
                href: changeWebsiteUrl
            },
            commonData: commonData,
            change: true
        })
        closeDialog();
    }
    if (e.target.id == "deleteDialog") {
        commonWebsite({
            thisWebsite: {
                href: changeWebsiteUrl
            },
            commonData: commonData,
            del: true
        })
        closeDialog();
    }
});

//监听搜索按钮
searchContent.querySelector("#searchBtn").addEventListener("click", () => {
    goSearch();
})

//监听选择引擎
selectOption.addEventListener("click", (e) => {
    let thisEngine = jsonData.engine.find(item => item.value == e.target.id);
    if (thisEngine !== undefined) {
        setEngine(thisEngine);
        searchFlag = !searchFlag;
    }
})

//解决点击元素内部隐藏的问题
sideBarContent.addEventListener("click", (e) => {
    stopPropagation();
    let thisWebsite = {};
    for (let item of jsonData.sideBar.content[1].content) {
        thisWebsite = item.content.find(inner => inner.icon == e.target.id);
        if (thisWebsite !== undefined) {
            thisWebsite.count = 1;
            commonWebsite({
                thisWebsite: thisWebsite,
                commonData: commonData
            });
            return;
        }
    }
    switch (true) {
        case e.target.id == "setBingImage":
            setBingImage(false);
            break;
        case e.target.id == "setdefault":
            setdefault("changebg");
            break;
        case (e.target.id.indexOf("skin") !== -1):
            changeSkin("skin", findSettingInfo(e.target.id));
            break;
        case (e.target.id.indexOf("uistyle") !== -1):
            changeUI("uistyle", findSettingInfo(e.target.id));
            break;
        case (e.target.id.indexOf("website") !== -1):
            commonWebsite({
                commonData: commonData,
                status: e.target.id
            });
            break;
    }
});

//监听文件上传change事件设置背景图片
scrollContent.addEventListener("change", function (e) {
    let setBackGround = document.querySelector("#setBackGround");
    if (e.target == setBackGround) {
        setCustomizeImage(setBackGround);
    }
})

//阻止消息提示事件冒泡
messageList.addEventListener("click", (e) => {
    stopPropagation();
})

commonUse.addEventListener("click", (e) => {
    if (e.target.className == "commons-addbtn") {
        openDialog({
            title: "添加常用网址",
            content: [{
                name: "名称",
                value: "name",
                type: "input",
                defaultValue: ""
            }, {
                name: "URl",
                value: "url",
                type: "input",
                defaultValue: ""
            }],
            button: [{
                name: "确定",
                value: "submit"
            }, {
                name: "取消",
                value: "cancel"
            }]
        })
    }
    if (e.target.className == "commons-btn") {
        changeWebsiteUrl = e.target.parentNode.querySelector("a").href
        openDialog({
            title: "修改常用网址",
            content: [{
                name: "名称",
                value: "name",
                type: "input",
                defaultValue: e.target.parentNode.querySelector("a").innerHTML
            }],
            button: [{
                name: "修改",
                value: "change"
            }, {
                name: "删除",
                value: "delete"
            }, {
                name: "取消",
                value: "cancel"
            }]
        })
    }
})

/*
    事件监听/事件委托相关结束
 */


/*
    键盘监听事件
 */
//监听按下键盘事件，实现按下Enter跳转搜索
document.onkeydown = function (e) {
    let event = e || event;
    if (event.keyCode == 13) {
        goSearch();
    }
}

searchContent.onkeydown = function (e) {
    let event = e || event;
    if (searchList.children.length != 0 && (event.keyCode == 38 || event.keyCode == 40)) {
        changeSug(event.keyCode)
    }
}

searchInput.onkeyup = () => {
    getSugValue();
}

/*
    键盘监听事件结束
 */


/*
    点击事件
 */
//点击选择搜索引擎事件
selectEngine.onclick = () => {
    if (searchFlag) {
        selectOption.style.display = "block";
        searchFlag = !searchFlag;
    } else {
        selectOption.style.display = "none";
        searchFlag = !searchFlag;
    }
    stopPropagation();
}

/*
    点击事件结束
 */


/*
    业务逻辑函数
 */

/*
    业务逻辑函数结束
 */