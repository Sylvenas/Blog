function getDataP(){
    if(a){
        return Promise.resolve(a);
    }else{
        return Ajax.get('a');
    }
}