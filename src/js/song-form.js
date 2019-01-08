
{
    let view = {
        el: '.page > main',
        template: `
            <h1>新建歌曲</h1>
            <form class="form">
              <div class="row">
                <label>
                  歌名
                </label>
                <input name="name" type="text" value="__name__">
              </div>
              <div class="row">
                <label>
                  歌手
                </label>
                <input name="singer" type="text" value="__singer__">
              </div>
              <div class="row">
                <label>
                  外链
                </label>
                <input name="url" type="text" value="__url__">
              </div>
              <div class="row actions">
                <button type="submit">保存</button>
              </div>
            </form>
        `,
        render(data = {}){
          //data默认什么都没传的情况下，声明一个默认的数组，把需要传的对象的属性值放在里面
          let placheholder = ['name','singer','url','id']
          html = this.template
          placheholder.map((string)=>{
            html = html.replace(`__${string}__`,data[string] || '')
          })
            $(this.el).html(html)
        },
        reset(){
          this.render({})
        }
    }
    let model = {
      data: {
        name: '',singer: '',url: '',id: ''
      },
      create(data){
        var Song = AV.Object.extend('Song')
        var song = new Song()
        //这里设置name singer url的值等于你传进来的data的值
        song.set('name',data.name)
        song.set('singer',data.singer)
        song.set('url',data.url)
        return song.save().then((newSong)=>{
          let {id, attributes} = newSong
          // data.id= id
          // data.name = attributes.name
          // data.singer = attributes.singer
          // data.url = attributes.url
          Object.assign(this.data,{
            id,
            ...attributes
          })
        }).catch((error)=>console.log(error))
      }
    }
    let controller = {
        view: null,
        model: null,
        $el: null,
        init(view, model){
            this.view = view
            this.model = model
            this.$el = $(this.view.el)
            this.view.render(this.model.data)
            this.bindEvent()
            window.eventHub.on('upload',(data)=>{
              //监听上传完毕后拿到data传给render
              this.view.render(data)
              console.log(data)
            })
        },
        bindEvent(){
          //监听表单的提交事件，这里用了事件委托，原因是form不是一开始就在页面中的，
          //而是通过调用this.view.render()才渲染到页面中的
          this.$el.on('submit','form',(e)=>{
            //阻止默认行为
            e.preventDefault()
            //声明一个对应input里面的name值的数组，下面用来作为data的key
            let needs = ['name','singer','url','id']
            let data = {}
            needs.map((string)=>{
              //相当于data.name=$(input[name="name"]).val()
              data[string]=this.$el.find(`[name=${string}]`).val()
            })
            this.model.create(data).then(()=>{
              this.view.reset()
              let string = JSON.stringify(this.model.data)
              let object = JSON.parse(string)
              window.eventHub.emit('create',object)
            })
          })
        }
    }
    controller.init.call(controller,view, model)
    
}
