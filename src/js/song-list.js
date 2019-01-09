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
            let liList = songs.map((song)=>$('<li></li>').text(song.name).attr('data-song-id',song.id))
            liList.map((domLi)=>{
                $el.find('ul').append(domLi)
            })
        },
        clearActive(){
            $(this.el).find('.active').removeClass('active')
        },
        activeItem(e){
            $(e.currentTarget).addClass('active').siblings().removeClass('active')
        }
    }
    let model = {
        data: {
            songs: []
        },
        find(){
            var query = new AV.Query('Song')
            return query.find().then((songs)=>{
                this.data.songs = songs.map((song)=>{
                    return {id:song.id,...song.attributes}
                })
                return this.data.songs
            })
        }
    }
    let controller = {
        view: null,
        model: null,
        init(view, model){
            this.view = view
            this.model = model
            this.model.find().then((res)=>{
                this.view.render(this.model.data)
            })
            this.view.render(this.model.data)
            this.bindEvent()
            this.bindEventHub()
        },
        bindEvent(){
            $(this.view.el).on('click','li',(e)=>{
                this.view.activeItem(e)
                let songId = $(e.currentTarget).attr('data-song-id')
                let song = this.model.data.songs
                let data
                for(let i=0;i<song.length;i++){
                    if(song[i].id === songId){
                        data= song[i]
                        break
                    }
                }
                window.eventHub.emit('select',JSON.parse(JSON.stringify(data)))
            })
        },
        bindEventHub(){
            window.eventHub.on('create',(data)=>{
                this.model.data.songs.push(data)
                this.view.render(this.model.data)
            })
            window.eventHub.on('new',(data)=>{
                this.view.clearActive()
            })
        }
    }
    controller.init.call(controller, view, model)
}