#!/bin/bash

NAME="Time Manager";
VERSION="1.0.0";
COMMENT="An app can help you control your time";
TYPE="Application";
APPLICATION_ICON_PATH="/usr/share/applications/";

cur_path=$(pwd);

exec_path=$cur_path;
exec_path+="/run.sh";

ico_path=$cur_path;
ico_path+="/views/img/logo.png";

icon_path=$cur_path;
icon_path+="/timemanager.desktop";

if [[ ! -e $icon_path ]]; then

	echo "[Desktop Entry]" >> $icon_path;
	echo "Version=$VERSION" >> $icon_path;
	echo "Name=$NAME" >> $icon_path;
	echo "Comment=$COMMENT" >> $icon_path;
	echo "Type=$TYPE" >> $icon_path;
	echo "Exec=$exec_path" >> $icon_path;
	echo "Icon=$ico_path" >> $icon_path;
	echo "Terminal=false" >> $icon_path;

	echo "Created .desktop file!";

	sudo chmod +x run.sh ;
	echo "Add priorities for runnable file!";

	sudo cp -a $icon_path $APPLICATION_ICON_PATH;
	echo "Copied files!";

	echo "Install successful!";
fi
