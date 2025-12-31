import os from 'node:os';
import lib from 'https://bash.ooo/lib.js';
import { Database } from "bun:sqlite";
import * as fs from 'node:fs/promises';
import path from 'node:path'

const { program } = require('commander')
program
    .name('bunu https://bash.ooo/china.js')
    .description('https://www.txthinking.com/talks/articles/china-list.article')
    .option('--source <string>', "gui: 自动查找 GUI 日志; /path/to/log: 服务端或客户端日志路径。[与 --how 一起使用]", '')
    .option('--how <string>', 'A: 从海外 IP 向海外 DNS 发起查询, 比如开启 GUI 的情况下或在服务器端运行, 缺点是如果域名同时有国内和海外 IP 则会被认为是海外域名; B: 从国内 IP 向阿里 DNS 发起查询, 比如在本地运行, 开启 GUI 情况下也没事，GUI 默认 bypass 了阿里 DNS, 缺点是如果返回的污染 IP 是国内的 IP 就会错乱，但历史经验不会, 还有一个缺点是 Google 有一些域名有国内的 IP。[与 --source 一起使用]', '')
    .option('--table', '打印整个表。[独立使用]', false)
    .option('--china <string>', '弥补 A 和 B 方案的不足，手动调整某个域名为国内域名。[独立使用]', '')
    .option('--global <string>', '弥补 A 和 B 方案的不足，手动调整某个域名为国际域名。[独立使用]', '')
    .option('--delete <string>', '移除某个域名. 如果想删除所有, 直接删除 rm -rf ~/.china.db。[独立使用]', '')
    .option('--modulea', '生成 module, 让中国域名走 bypass DNS 来解析出 A 记录，然后直接 bypass。[独立使用]', false)
program.parse();
const options = program.opts();

if (!options.china && !options.global && !options.delete && !options.table && !options.modulea && (!options.source || !options.how)) {
    program.help()
}

var db = new Database(os.homedir() + "/.china.db", { create: true });
var l = db.query(`SELECT name FROM sqlite_master WHERE type='table'`).all();
if (!l.find(v => v.name == 'cn')) {
    db.query(`
create table cn(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain text not null UNIQUE,
    iscn INTEGER not null default 0
)
`).run();
    // 内置部分主流域名
    db.query('insert into cn(domain, iscn) values(?, ?)').run('cn', 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("wxcloudrun.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("alibabadns.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("10010.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("115.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("126.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("127.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("163.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("163jiasu.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("163yun.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("1905.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("21cn.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("300hu.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("321fenx.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("360buyimg.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("365dmp.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("71edge.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("95516.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("adkwai.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("adukwai.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("aggrx.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ali-health.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("aliapp.org", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("alibaba-inc.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("alibaba.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("alibabausercontent.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("alicdn.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("alipay.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("alipayobjects.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("aliyun.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("aliyuncs.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("amap.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("amemv.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("baidu.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("baidubce.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("baidupcs.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("baidustatic.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("baifubao.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("baishan.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("baizhanlive.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bcebos.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bcelive.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bdimg.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bdstatic.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bdurl.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bdxiguastatic.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bdxiguavod.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bigda.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("biliapi.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("biliapi.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bilibili.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("biligame.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("biligame.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bilivideo.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bjshcw.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bosszhipin.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bytedance.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("byteeffecttos.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bytegecko.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bytegoofy.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("byteimg.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bytemaimg.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bytemastatic.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bytescm.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("bytetos.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("c-ctrip.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("calorietech.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("cdnhwc2.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("cdntips.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("chinanetcenter.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("cibntv.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("cl2009.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("cmbchina.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("cmbimg.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("cmpassport.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("cnzz.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("cpatrk.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ctfile.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ctobsnssdk.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("dbankcloud.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("dewu.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("dewucdn.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("dianping.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("douyincdn.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("douyinliving.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("douyinstatic.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("douyinvod.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("douyu.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("dpfile.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("dutils.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("duxiaoman.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("duxiaomanfintech.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("dxmpay.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("easytomessage.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("eckwai.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ecukwai.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("effirst.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("etoote.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("fengkongcloud.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("fun.tv", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("funshion.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("funshion.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("gdtimg.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("geetest.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("gepush.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("getui.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("getui.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("gifshow.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("gotokeep.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("gridsumdissector.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("gtimg.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("hc-cdn.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("hdslb.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("hicloud.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("hitv.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("httpdns.pro", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("huanqiu.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("huaweicloud.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("hunantv.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("huoshan.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("huoshanlive.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("huoshanstatic.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("huoshanvod.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("id6.me", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("idqqimg.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("igexin.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ihuoshanlive.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("imtmp.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("inkuai.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ip6.arpa", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ipaddr.host", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ipv4only.arpa", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("iqiyi.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("iqiyipic.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("irs01.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("itoutiaostatic.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ixigua.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("jd.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("jdcloud.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("jinhuahuolong.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("jomoxc.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("joying.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("jpush.io", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("keepcdn.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ksapisrv.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("kskwai.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ksord.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ksosoft.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("kspkg.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ksyun.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ksyungslb.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("kuaishou.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("kuaishouzt.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("kuiniuca.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("kwai.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("kwaicdn.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("kwaizt.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("kwimgs.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("laiqukankan.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("le.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("letv.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("letvimg.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("leyingtt.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("lnk0.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("m1905.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("maoyan.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("meipai.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("meitu.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("meituan.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("meituan.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("meitudata.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("meitustat.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("meizu.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("mgtv.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("miaozhen.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("migucloud.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("miguvideo.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("mmstat.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("mob.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("myapp.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("myqcloud.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("myzhiniu.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("mzstatic.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("netease.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("netease.im", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("nintyinc.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("novelfm.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("novelfmstatic.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("onethingpcs.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("onewsvod.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("oskwai.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("pangolin-dsp-toutiao.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("pangolin-sdk-toutiao-b.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("pangolin-sdk-toutiao.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("pddpic.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("pddugc.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("pglstatp-toutiao.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("pinduoduo.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("pinduoduo.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("poizon.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ppsimg.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("pstatp.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("qcloud.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("qingting.fm", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("qiniup.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("qiyi.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("qiyukf.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("qmail.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("qnqcdn.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("qq.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("qqmail.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("qy.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("rr.tv", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("sankuai.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("servicewechat.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("shuqireader.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("smtcdns.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("snssdk.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("sohu.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("sohucs.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("szbdyd.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("tamaegis.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("tanx.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("taobao.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("tdatamaster.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("tencent-cloud.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("tencent-cloud.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("tencent.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("tencentmusic.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("tenpay.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("tfogc.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("tingyun.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("tmall.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("toutiao.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("toutiaoapi.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("toutiaostatic.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("toutiaovod.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("tudou.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("tv002.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ucweb.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ugdtimg.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ulikecam.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("umeng.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("umengcloud.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("umsns.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("unionpay.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("upqzfile.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("vemarsdev.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("vemarsstatic.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("vlabvod.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("volceapplog.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("volces.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("vzuu.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("wanzjhb.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("weibo.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("weibocdn.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("weiyun.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("wnsqzonebk.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("xhscdn.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("xiaodutv.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("xiaohongshu.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("xiaomi.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("xiaomi.net", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ximalaya.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("xiuxiustatic.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("xmcdn.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("xxpkg.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("xycdn.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("yangkeduo.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("ykimg.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("youku.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("yqkk.link", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("yximgs.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("yy.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("yystatic.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("zhihu.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("zhimg.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("zhipin.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("zhuanzfx.com", 1)
    db.query('insert into cn(domain, iscn) values(?, ?)').run("zijieapi.com", 1)
}

if (options.china) {
    var l1 = options.china.split('.')
    var a = l1.pop()
    var b = l1.pop()
    var d = b + '.' + a
    var r = db.query('select * from cn where domain=?').get(d);
    if (r) {
        db.query('update cn set iscn=1 where domain=?').run(d);
    } else {
        db.query('insert into cn(domain, iscn) values(?, ?)').run(d, 1)
    }
    process.exit()
}

if (options.global) {
    var l1 = options.global.split('.')
    var a = l1.pop()
    var b = l1.pop()
    var d = b + '.' + a
    var r = db.query('select * from cn where domain=?').get(d);
    if (r) {
        db.query('update cn set iscn=2 where domain=?').run(d);
    } else {
        db.query('insert into cn(domain, iscn) values(?, ?)').run(d, 2)
    }
    process.exit()
}

if (options.delete) {
    db.query('delete from cn where domain=?').run(options.delete);
    process.exit()
}

if (options.table) {
    var r = db.query('select * from cn').all();
    r.sort((a, b) => a.domain > b.domain)
    const { printTable } = require('console-table-printer');
    printTable(r)
    process.exit()
}

if (options.modulea) {
    var r = db.query('select * from cn where iscn=1').all();
    var i = 0
    var s = ""
    var l = []
    r.map(v => v.domain).forEach(v => {
        l.push(`"${v}": true,`)
        i++
        if (i == 200) {
            s += `
            l = {
${l.join("\n").slice(0, -1)}
            }
            r = f(hp.host, l)
            if r != undefined {
                return r
            }
`
            i = 0
            l = []
        }
    })
    if (l.length) {
        s += `
            l = {
${l.join("\n").slice(0, -1)}
            }
            r = f(hp.host, l)
            if r != undefined {
                return r
            }
`
    }
    s = `
modules = append(modules, {
    address: func(m) {
        if m.domainaddress {
            brook := import("brook")
            hp := brook.splithostport(m.domainaddress)
            if is_error(hp) {
                return hp
            }
            text := import("text")
            f := func(domain, l){
                ss := text.split(text.to_lower(domain), ".")
                s := ""
                for i := len(ss) - 1; i >= 0; i-- {
                    if s == "" {
                        s = ss[i]
                    } else {
                        s = ss[i] + "." + s
                    }
                    if l[s] {
                        return { ipaddressfrombypassdns: "A", bypass: true }
                    }
                }
            }
            l := undefined
            r := undefined
            ${s}
        }
    }
})
`
    console.log(s)
    process.exit()
}

function get_domain(addr) {
    if (addr.indexOf(':') == -1) {
        return addr
    }
    if (addr.startsWith('[')) {
        return
    }
    var i = addr.lastIndexOf(':')
    var s = addr.slice(0, i)
    if (/^[\d\.]+$/.test(s)) {
        return
    }
    return s
}

async function exists(file) {
    try {
        await fs.access(file, fs.constants.F_OK)
        return true
    } catch {
        return false
    }
}

async function get_todo() {
    var l = []
    if (options.source == 'gui') {
        if (os.platform() == "darwin") {
            if (await exists(os.homedir() + "/Library/Group Containers/FZS65P7GSQ.brook/b.log")) {
                var s = await fs.readFile(os.homedir() + "/Library/Group Containers/FZS65P7GSQ.brook/b.log", { encoding: 'utf8' })
                if (s && s.trim()) {
                    l = l.concat(s.trim().split("\n").map(v => JSON.parse(v)).filter(v => v.action == "PROXY").map(v => get_domain(v.content)).filter(v => v))
                }
            }
            if (await exists(os.homedir() + "/Library/Group Containers/FZS65P7GSQ.brook/b.log")) {
                var s = await fs.readFile(os.homedir() + "/Library/Group Containers/FZS65P7GSQ.brook/b.logcom.txthinking.brook.one", { encoding: 'utf8' })
                if (s && s.trim()) {
                    l = l.concat(s.trim().split("\n").map(v => JSON.parse(v)).filter(v => v.action == "PROXY" && v.domainaddress).map(v => get_domain(v.domainaddress)).filter(v => v))
                }
            }
        }
        if (os.platform() == "linux") {
            if (await exists(os.homedir() + "/.Brook.log")) {
                var s = await fs.readFile(os.homedir() + "/.Brook.log", { encoding: 'utf8' })
                if (s && s.trim()) {
                    l = l.concat(s.trim().split("\n").map(v => JSON.parse(v)).filter(v => v.action == "PROXY").map(v => get_domain(v.content)).filter(v => v))
                }
            }
            if (await exists(os.homedir() + "/.Shiliew.log")) {
                var s = await fs.readFile(os.homedir() + "/.Shiliew.log", { encoding: 'utf8' })
                if (s && s.trim()) {
                    l = l.concat(s.trim().split("\n").map(v => JSON.parse(v)).filter(v => v.action == "PROXY" && v.domainaddress).map(v => get_domain(v.domainaddress)).filter(v => v))
                }
            }
        }
        if (os.platform() == "win32") {
            if (await exists(`C:\\ProgramData\\.Brook.log`)) {
                var s = await fs.readFile(`C:\\ProgramData\\.Brook.log`, { encoding: 'utf8' })
                if (s && s.trim()) {
                    l = l.concat(s.trim().split("\n").map(v => JSON.parse(v)).filter(v => v.action == "PROXY").map(v => get_domain(v.content)).filter(v => v))
                }
            }
            if (await exists(`C:\\ProgramData\\.Shiliew.log`)) {
                var s = await fs.readFile(`C:\\ProgramData\\.Shiliew.log`, { encoding: 'utf8' })
                if (s && s.trim()) {
                    l = l.concat(s.trim().split("\n").map(v => JSON.parse(v)).filter(v => v.action == "PROXY" && v.domainaddress).map(v => get_domain(v.domainaddress)).filter(v => v))
                }
            }
        }
    } else {
        var s = await fs.readFile(options.source, { encoding: 'utf8' })
        if (s && s.trim()) {
            l = l.concat(s.trim().split("\n").map(v => JSON.parse(v)).filter(v => v.action == "PROXY" && v.content).map(v => get_domain(v.content)).filter(v => v))
            l = l.concat(s.trim().split("\n").map(v => JSON.parse(v)).filter(v => v.action == "PROXY" && v.domainaddress).map(v => get_domain(v.domainaddress)).filter(v => v))
            l = l.concat(s.trim().split("\n").map(v => JSON.parse(v)).filter(v => v.dst).map(v => get_domain(v.dst)).filter(v => v))
            l = l.concat(s.trim().split("\n").map(v => JSON.parse(v)).filter(v => v.dns).map(v => get_domain(v.domain)).filter(v => v))
        }
    }
    if (!l.length) {
        console.log('没有发现域名')
        process.exit(1)
    }
    return [...new Set(l)]
}

async function get_cn_domain_with_global_dns(domain) {
    var s = await lib.sh(`brook dohclient -s "https://one.one.one.one/dns-query?address=1.1.1.1:443" -t A --short -d ${domain}`)
    if (s) {
        if ((await lib.sh(`brook ipcountry --ip ${s.trim()}`)).trim() != 'CN') {
            return
        }
        s = await lib.sh(`brook dohclient -s "https://one.one.one.one/dns-query?address=1.1.1.1:443" -t A -d ${domain}`)
        var l = s.trim().split('\n').map(v => v.split(/\s+/)).filter(v => v.length == 5 && v[3] == 'CNAME').map(v => v[4].slice(0, -1))
        l.push(domain)
        return l.map(v => {
            var l1 = v.split('.')
            var a = l1.pop()
            var b = l1.pop()
            return b + '.' + a
        })
    }
    var s = await lib.sh(`brook dohclient -s "https://one.one.one.one/dns-query?address=1.1.1.1:443" -t AAAA --short -d ${domain}`)
    if (s) {
        if ((await lib.sh(`brook ipcountry --ip ${s.trim()}`)).trim() != 'CN') {
            return
        }
        s = await lib.sh(`brook dohclient -s "https://one.one.one.one/dns-query?address=1.1.1.1:443" -t AAAA -d ${domain}`)
        var l = s.trim().split('\n').map(v => v.split(/\s+/)).filter(v => v.length == 5 && v[3] == 'CNAME').map(v => v[4].slice(0, -1))
        l.push(domain)
        return l.map(v => {
            var l1 = v.split('.')
            var a = l1.pop()
            var b = l1.pop()
            return b + '.' + a
        })
    }
    throw `unknown ${domain}`
}

async function get_cn_domain_with_china_dns(domain) {
    var s = await lib.sh(`brook dohclient -s 'https://dns.alidns.com/dns-query?address=223.5.5.5:443' -t A --short -d ${domain}`)
    if (s) {
        if ((await lib.sh(`brook ipcountry --ip ${s.trim()}`)).trim() != 'CN') {
            return
        }
        s = await lib.sh(`brook dohclient -s 'https://dns.alidns.com/dns-query?address=223.5.5.5:443' -t A -d ${domain}`)
        var l = s.trim().split('\n').map(v => v.split(/\s+/)).filter(v => v.length == 5 && v[3] == 'CNAME').map(v => v[4].slice(0, -1))
        l.push(domain)
        return l.map(v => {
            var l1 = v.split('.')
            var a = l1.pop()
            var b = l1.pop()
            return b + '.' + a
        })
    }
    var s = await lib.sh(`brook dohclient -s 'https://dns.alidns.com/dns-query?address=223.5.5.5:443' -t AAAA --short -d ${domain}`)
    if (s) {
        if ((await lib.sh(`brook ipcountry --ip ${s.trim()}`)).trim() != 'CN') {
            return
        }
        s = await lib.sh(`brook dohclient -s 'https://dns.alidns.com/dns-query?address=223.5.5.5:443' -t AAAA -d ${domain}`)
        var l = s.trim().split('\n').map(v => v.split(/\s+/)).filter(v => v.length == 5 && v[3] == 'CNAME').map(v => v[4].slice(0, -1))
        l.push(domain)
        return l.map(v => {
            var l1 = v.split('.')
            var a = l1.pop()
            var b = l1.pop()
            return b + '.' + a
        })
    }
    throw `unknown ${domain}`
}

var l = await get_todo()
console.log('todo', l.length)
for (var i = 0; i < l.length; i++) {
    var d = l[i].toLowerCase()
    if (d.endsWith('.cn')) {
        continue
    }
    var l1 = d.split('.')
    var a = l1.pop()
    var b = l1.pop()
    var s0 = b + '.' + a
    var r = db.query('select * from cn where domain=? or domain like ?').get(s0, "%." + s0);
    if (r) {
        continue
    }
    try {
        var l1 = await lib.retry(async () => options.how == 'A' ? await get_cn_domain_with_global_dns(d) : await get_cn_domain_with_china_dns(d), 1000, 2)
        if (l1) {
            l1.forEach(v => {
                var r = db.query('select * from cn where domain=?').get(v);
                if (r) {
                    return
                }
                db.query('insert into cn(domain, iscn) values(?, ?)').run(v, 1)
            })
        } else {
            db.query('insert into cn(domain, iscn) values(?, ?)').run(s0, 2)
        }
        console.log(`${parseInt((i + 1) / l.length * 100)}%`)
    } catch (e) {
        console.log(d, e.toString())
    }
}
