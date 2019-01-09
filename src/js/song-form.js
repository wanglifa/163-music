
{
    let view = {
        el: '.page > main',
        template: `
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
          let placheholder = ['name','singer','url','id']
           html = this.template
           placheholder.map((string)=>{
             html = html.replace(`__${string}__`,data[string] || '')
           })
          $(this.el).html(html)
          if(data.id){
            $(this.el).prepend('<h1>编辑歌曲</h1>')
          }else{
            $(this.el).prepend('<h1>新建歌曲</h1>')
          }
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
          return Object.assign(this.data,{
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
            this.bindEventHub()
        },
        bindEvent(){
          this.$el.on('submit','.form',(e)=>{
            e.preventDefault()
            let info = ['name','singer','url','id']
            let data = {}
            info.map((name)=>{
              data[name] = this.$el.find(`[name=${name}]`).val()
            })
            this.model.create(data).then((data)=>{
              let string = JSON.stringify(data)
              let object = JSON.parse(string)
              window.eventHub.emit('create',object)
              this.view.reset()
            })
          })
        },
        bindEventHub(){
          window.eventHub.on('select',(data)=>{
            this.model.data = data
            this.view.render(this.model.data)
          })
          window.eventHub.on('new',(data)=>{
            //如果数据库里有这首歌曲的id，那么就清空
            if(this.model.data.id){
              this.model.data = {name: '',singer: '',url: '',id: ''}
            }else{
              //否则就把你当前的data赋值给this.model.data，又因为有可能没有data，
              //所以需要在没data的时候就等于this.model.data
              this.model.data = data || this.model.data
              //Object.assign(this.model.data,data)
            }
            console.log(this.model.data)
            this.view.render(this.model.data)
          })
        }
    }
    controller.init.call(controller,view, model)
    
}
