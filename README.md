# etrick

Eggs use this DHCPD PROXY server to provide PXE boot information to the clients, it need the presence of a standard DHCPD server on the LAN, but You don't need to reconfigure it to add PXE fields.

This project started on the only working dhcpd proxy in nodejs who I found: FOGProject [node-dhcproxy](https://github.com/FOGProject/node-dhcproxy). After using it to implement a PXE server for eggs, I started to feel the need to have my version and perhaps to evolve it on a complete PXE server. 

So I decided to rewrite it in typescript, give a structure and start to use it for eggs.

But I'm still working, it's just on the initial phase. 

The right moment to get on and help! 

Reference:
* [node-dhcproxy](https://github.com/FOGProject/node-dhcproxy) node-dhcproxy is based on [node-dhcpd](https://github.com/glaszig/node-dhcpd)

 