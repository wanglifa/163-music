{
    let view = {
        el: '#songList-wrapper',
    template: `
        <ul class="songList">
        </ul>
    `,
    render(data){
        let $el = $(this.el)
        $el.html(this.template)
        let {songs} = data
        let liList = songs.map((song)=>$('<li></li>').text(song.name))
        liList.map((domLi)=>{
            $el.find('ul').append(domLi)
        })
    },
    clearActive(){
        $(this.el).find('.active').removeClass('active')
    }
    }
    let model = {
        data: {
            songs: []
        }
    }
    let controller = {
        view: null,
        model: null,
        init(view, model){
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            window.eventHub.on('upload',(data)=>{
                this.view.clearActive()
            })
            window.eventHub.on('create',(data)=>{
                this.model.data.songs.push(data)
                this.view.render(this.model.data)
            })
        },
        resert(){
            console.log('resert')
        }
    }
    controller.init.call(controller, view, model)
}