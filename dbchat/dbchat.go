package main

import "github.com/spf13/cobra"

func main() {
	loadConfig()
	var rootCmd = &cobra.Command{
		Use: "dbchat",
	}
	rootCmd.AddCommand(&cobra.Command{
		Use:   "run",
		Short: "install [dir]",
		Args:  cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			run()
		},
	})
	rootCmd.AddCommand(&cobra.Command{
		Use:   "install",
		Short: "install [dir] [name]",
		Args:  cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			name := "dbchat"
			dir := "."
			if len(args) > 0 {
				dir = args[0]
			}
			if len(args) > 1 {
				name = args[1]
			}
			install(name, dir)
		},
	})
	rootCmd.AddCommand(&cobra.Command{
		Use:   "uninstall",
		Short: "uninstall name",
		Args:  cobra.MinimumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {

		},
	})
	rootCmd.Execute()
}

func loadConfig() {

}
func run() {

}
func install(name string, dir string) {

}
