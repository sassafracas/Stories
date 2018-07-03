class PhotostoriesController < ApplicationController

  def index
    render json: PhotoStory.all
  end

  def show
    @photostory = PhotoStory.find_by(id: params[:id])

    render json: @photostory
  end

  def create
    @photostory = PhotoStory.new

    @photostory.title = params[:title]

    if (@photostory.save)
      render json: {
        title: @photostory.title,
      }
    else
      render json: {
        errors: @photostory.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def photostory_photos
    @photostory = PhotoStory.find_by(id: params[:id])

    render json: @photostory.photos
  end

  def destroy
    @photostory = PhotoStory.find_by(id: params[:id])

    @photostory.destroy

    render json: PhotoStory.all
  end

end
