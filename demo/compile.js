/*
* @Author: ZhaoYuanDa
* @Date:   2020-09-23 16:52:35
* @Last Modified by:   ZhaoYuanDa
* @Last Modified time: 2020-09-25 21:37:58
*/

/**
 * 做指令渲染的
 */
class Compile{
    /**
     * 参数1：需要渲染的模班
     * 参数2：vm的实例对象
     *
     */
    constructor(el,vm){
        // 直接拿到dom对象 也可以直接传个dom对象这样就省了这步
        this.el = typeof el === 'string' ?  document.querySelector(el) : el
        // new vue的实例
        this.vm = vm

        if (this.el) {
            // 1 把el所有的子节点都放到内存中，fragment
            let framgement = this.node2fragment(this.el)
            // 2 在内存中去编译fragment
            this.compile(framgement)
            // 3.把fragment一次性的添加到页面中
            this.el.appendChild(framgement)
        }
    }
    /**
     * 核心方法
     */
    node2fragment(node){
        let framgement = document.createDocumentFragment()
        //把el中所有的子节点添加到文档碎片中
        //这时一个类数组
        let cnodes = node.childNodes
        this.toArray(cnodes).forEach(node=>{
            // 把所有的子节点都添加到frament
            framgement.appendChild(node)
        })
        // console.log(framgement)
        return framgement
    }

    // 解析文本节点 解析插值表达式
    compileText(node){
        // 获取到里面的值
        let txt = node.textContent
        // 处理找到里面的{{}} 正则表达式
        let reg = /\{\{(.+)\}\}/
        if (reg.test(txt)) {
            // 找到attrval
            let attrval = RegExp.$1
            // debugger
            // 把对应得差值换成data值

            node.textContent = txt.replace(reg,compileUtil['getVMValue'](this.vm,attrval))
            new Watcher(this.vm,attrval,(newValue,oldValue)=>{
            node.textContent = txt.replace(reg,newValue)
        })
            // console.log(attrval)
        }
    }
    // 解析元素节点
    compileElement(node){
        // 1.获取到当前节点下所有的属性
        let attribute =  node.attributes
        this.toArray(attribute).forEach(attr=>{
        // 2.解析vue的指令（v-）
        // console.dir(attr)
        //
        let attrname = attr.nodeName
        if (this.isDirective(attrname)) {
            // 是vue指令 然后取v-后面的那部分
            let type = attrname.slice(2)
            let attrval = attr.nodeValue

            // 如果是v-text
            // if (type === 'text') {
            //     // 将文本中对应指令的节点内容设置为data里面对应属性的值
            //     // 这里面注意不能写成.attrval的形式因为那样不会解析出attrval这个值
            //     node.textContent = this.vm.$data[attrval]
            //     // console.log(node)
            // }

            // if (type === "html") {
            //     node.innerHTML = this.vm.$data[attrval]
            //     console.dir(node)
            // }
            // if (type === "model") {
            //     // 注意input这种使用value属性进行赋值的
            //     node.value = this.vm.$data[attrval]
            // }

            if (type.split(':')[0] === 'on') {
                // 给node注册时间
                // let eventName = type.split(':')[1]
                // 这里面注意如果第二个参数里面的函数里面有this的话他是指向node的
                // 用bind以后会改变this指向并且返回一个新的函数，call不行
                // node.addEventListener(eventName,this.vm.$methods[attrval].bind(this.vm))
                compileUtil['eventHander'](node,this.vm,type,attrval)
            }else{
                compileUtil[type] && compileUtil[type](node,this.vm,attrval)
            }


        }

        })



    }

    /**
     * 工具方法
     */
    toArray(likearry){
        return [].slice.call(likearry)
    }
    // 判断是否是指令
    isDirective(attrname){
        // ES6新增的方法 以什么开头
        return attrname.startsWith('v-')
    }

    // 判断是不是元素节点
    isElementNode(node){
        return node.nodeType === 1
    }
    // 判断是不是文本节点
    isTextNode(node){
        return node.nodeType === 3
    }


    /**
     * 编译文档碎片在内存中
     */
    compile(framgement){
        let childNodes = framgement.childNodes
        this.toArray(childNodes).forEach(node => {
            // 如果是元素，需要解析指令
            // 如果是文本节点，需要解析差值表达式
            if (this.isElementNode(node)) {
                this.compileElement(node)
            }
            if (this.isTextNode(node)) {
                this.compileText(node)
            }
            // 如果当前节点还有子节点要继续递归执行,不然的话没办法获取里面
            if (node.childNodes && node.childNodes.length>0) {
                this.compile(node)
            }
        })

    }

}


let compileUtil = {
    // 处理v-text指令
    text(node,vm,attrval){
        node.textContent = this.getVMValue(vm,attrval)
        // 这里监听数值有没有发生变化，一旦变化，就执行回调函数就行 在updata()函数执行以后才会执行
      // window.watcher =  new Watcher(vm,attrval,(newValue,oldValue)=>{
      //       node.textContent = newValue
      //   })
      new Watcher(vm,attrval,(newValue,oldValue)=>{
            node.textContent = newValue
        })
    },
    // 处理HTML指令
    html(node,vm,attrval){
        node.innerHTML = this.getVMValue(vm,attrval)
        new Watcher(vm,attrval,(newValue,oldValue)=>{
            node.innerHTML = newValue
        })
    },
    // 处理model指令 实现双向绑定
    model(node,vm,attrval){
        let that = this
        node.value = this.getVMValue(vm,attrval)
        node.addEventListener('input', function(){
            that.setVMValue(vm,attrval,node.value)
        })
        new Watcher(vm,attrval,(newValue,oldValue)=>{
            node.value = newValue

        })

    },
    // 处理v-on指令
    eventHander(node,vm,type,attrval){
        let eventName = type.split(':')[1]
        node.addEventListener(eventName,vm.$methods[attrval].bind(vm) )
    },



    // 获取vm的数据 有解决a.b.c的情况
    // 这里不应该会修改到vm的值吗
    getVMValue(vm,attrval){
        let data = vm.$data
        attrval.split('.').forEach(key=>{
           data = data[key]
        })
        return data
    },
    // 更改a.b.c设值
    setVMValue(vm,attrval,value){
        let data = vm.$data
        let arr = attrval.split('.')
        arr.forEach((item,index)=>{
          if (index <arr.length-1 ) {
            // 不是最后一项就往内挖掘
            data = data[item]
          }else{
            // 这样就把属性里面的值改变了 引用类型
            data[item] = value
          }
        })
    }


}

