package bot

import (
	"datagrove/dgrtc"
	"os"
)

// offer SFTP over a DataChannel

func SftpHandler(ch dgrtc.SocketLike, dir string) {
	os.Chdir(dir)

}
